// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ChatAccessControl
 * @notice Maps wallet addresses to IPFS CIDs for encrypted chat storage.
 *         Supports user-controlled access grants so therapists can view
 *         specific chat records only when the patient explicitly allows it.
 * @dev Deploy on Polygon Amoy testnet. Each user can store, share, and
 *      revoke access to their own records.
 */
contract ChatAccessControl {
    // wallet address => array of IPFS CIDs
    mapping(address => string[]) private userRecords;

    // patient => therapist => CID => granted
    mapping(address => mapping(address => mapping(string => bool))) private accessGrants;

    // therapist => list of (patient, CID) pairs they have access to
    struct SharedRecord {
        address patient;
        string ipfsHash;
    }
    mapping(address => SharedRecord[]) private therapistSharedRecords;

    event RecordStored(address indexed user, string ipfsHash, uint256 index);
    event AccessGranted(address indexed patient, address indexed therapist, string ipfsHash);
    event AccessRevoked(address indexed patient, address indexed therapist, string ipfsHash);

    /**
     * @notice Store a new IPFS CID for the caller.
     * @param ipfsHash The IPFS content identifier (CID) to store.
     */
    function storeRecord(string memory ipfsHash) public {
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        userRecords[msg.sender].push(ipfsHash);
        emit RecordStored(msg.sender, ipfsHash, userRecords[msg.sender].length - 1);
    }

    /**
     * @notice Retrieve all IPFS CIDs for the caller.
     * @return An array of IPFS CID strings.
     */
    function getRecords() public view returns (string[] memory) {
        return userRecords[msg.sender];
    }

    /**
     * @notice Get the number of records stored by the caller.
     * @return The count of stored CIDs.
     */
    function getRecordCount() public view returns (uint256) {
        return userRecords[msg.sender].length;
    }

    /**
     * @notice Grant a therapist access to a specific IPFS CID.
     * @param therapist The therapist's wallet address.
     * @param ipfsHash  The IPFS CID to share.
     */
    function grantAccess(address therapist, string memory ipfsHash) public {
        require(therapist != address(0), "Invalid therapist address");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(!accessGrants[msg.sender][therapist][ipfsHash], "Access already granted");

        accessGrants[msg.sender][therapist][ipfsHash] = true;
        therapistSharedRecords[therapist].push(SharedRecord({
            patient: msg.sender,
            ipfsHash: ipfsHash
        }));

        emit AccessGranted(msg.sender, therapist, ipfsHash);
    }

    /**
     * @notice Revoke a therapist's access to a specific IPFS CID.
     * @param therapist The therapist's wallet address.
     * @param ipfsHash  The IPFS CID to un-share.
     */
    function revokeAccess(address therapist, string memory ipfsHash) public {
        require(accessGrants[msg.sender][therapist][ipfsHash], "Access not granted");
        accessGrants[msg.sender][therapist][ipfsHash] = false;

        // Remove from therapistSharedRecords array
        SharedRecord[] storage records = therapistSharedRecords[therapist];
        for (uint256 i = 0; i < records.length; i++) {
            if (records[i].patient == msg.sender && keccak256(bytes(records[i].ipfsHash)) == keccak256(bytes(ipfsHash))) {
                records[i] = records[records.length - 1];
                records.pop();
                break;
            }
        }

        emit AccessRevoked(msg.sender, therapist, ipfsHash);
    }

    /**
     * @notice Check if a therapist has access to a patient's specific CID.
     * @param patient   The patient's wallet address.
     * @param therapist The therapist's wallet address.
     * @param ipfsHash  The IPFS CID to check.
     * @return True if access is granted.
     */
    function hasAccess(address patient, address therapist, string memory ipfsHash) public view returns (bool) {
        return accessGrants[patient][therapist][ipfsHash];
    }

    /**
     * @notice Get all shared records for the calling therapist.
     * @return patients Array of patient addresses.
     * @return cids     Array of IPFS CIDs.
     */
    function getSharedRecords() public view returns (address[] memory patients, string[] memory cids) {
        SharedRecord[] storage records = therapistSharedRecords[msg.sender];
        patients = new address[](records.length);
        cids = new string[](records.length);

        for (uint256 i = 0; i < records.length; i++) {
            patients[i] = records[i].patient;
            cids[i] = records[i].ipfsHash;
        }
    }
}
