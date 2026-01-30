import { NextResponse } from 'next/server';

// In-memory store for MVP (reset on restart)
const sessions: Record<string, any> = {};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, scenarioId, ...data } = body;

        if (action === 'START') {
            const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            sessions[sessionId] = {
                id: sessionId,
                scenarioId,
                startTime: new Date(),
                status: 'active'
            };
            return NextResponse.json({ success: true, sessionId });
        }

        if (action === 'END') {
            const { sessionId, metrics, transcript } = data;
            if (sessions[sessionId]) {
                sessions[sessionId] = {
                    ...sessions[sessionId],
                    status: 'completed',
                    endTime: new Date(),
                    metrics,
                    transcript
                };
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

    } catch (error) {
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}
