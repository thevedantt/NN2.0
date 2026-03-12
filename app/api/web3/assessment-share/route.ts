import { NextRequest, NextResponse } from "next/server";
import { db } from "@/config/db";
import { chatAccessGrants } from "@/config/schema";
import { jwtVerify } from "jose";
import { encryptData } from "@/lib/web3/encryption";
import { uploadToIPFS } from "@/lib/web3/ipfs";

const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_key_change_me";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
    const token = req.cookies.get("auth_token")?.value;
    if (!token) return null;
    try {
        const { payload } = await jwtVerify(token, encodedKey);
        return payload.sub as string;
    } catch {
        return null;
    }
}

/**
 * POST - Upload assessment results to IPFS (encrypted) and grant therapist access.
 * Body: {
 *   therapistUserId: string,
 *   patientWallet: string,
 *   therapistWallet: string,
 *   assessmentType: string,   // "phq-9" or "gad-7"
 *   score: number,
 *   level: string,
 *   answers: number[],
 *   questions: string[]
 * }
 */
export async function POST(req: NextRequest) {
    try {
        const userId = await getUserIdFromRequest(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const {
            therapistUserId,
            patientWallet,
            therapistWallet,
            assessmentType,
            score,
            level,
            answers,
            questions,
        } = await req.json();

        if (!therapistUserId || !patientWallet || !therapistWallet || !assessmentType) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Build assessment data payload
        const assessmentData = {
            type: "assessment_result",
            assessmentType,
            score,
            level,
            answers,
            questions,
            userId,
            exportedAt: new Date().toISOString(),
        };

        // Encrypt the data
        const jsonString = JSON.stringify(assessmentData);
        const encrypted = encryptData(jsonString, patientWallet);

        // Upload to IPFS
        const cid = await uploadToIPFS({
            encrypted,
            metadata: {
                type: "assessment",
                assessmentType,
                timestamp: new Date().toISOString(),
            },
        });

        // Record the grant in DB (sessionId = null for assessment shares)
        const newGrant = await db.insert(chatAccessGrants).values({
            patientUserId: userId,
            therapistUserId,
            patientWallet,
            therapistWallet,
            sessionId: null,
            dataType: 'assessment',
            ipfsCid: cid,
            txHash: null,
        }).returning({ grantId: chatAccessGrants.grantId });

        return NextResponse.json({
            success: true,
            cid,
            grantId: newGrant[0].grantId,
        });

    } catch (error) {
        console.error("[Assessment Share] Error:", error);
        return NextResponse.json({ error: "Failed to share assessment" }, { status: 500 });
    }
}
