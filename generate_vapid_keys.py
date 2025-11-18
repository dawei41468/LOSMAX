#!/usr/bin/env python3
"""
Script to generate VAPID keys for push notifications.
Run this script to generate your VAPID public and private keys.
"""

import base64
import os
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import ec

def generate_vapid_keys():
    """Generate VAPID key pair for push notifications"""

    # Generate ECDSA key pair
    private_key = ec.generate_private_key(ec.SECP256R1())

    # Get private key in PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Get public key
    public_key = private_key.public_key()

    # Get public key in uncompressed format (as required by VAPID)
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.X962,
        format=serialization.PublicFormat.UncompressedPoint
    )

    # Base64url encode the public key
    vapid_public_key = base64.urlsafe_b64encode(public_bytes).decode('utf-8').rstrip('=')


    print("🔑 VAPID Keys Generated Successfully!")
    print("=" * 50)
    print(f"VAPID_PUBLIC_KEY={vapid_public_key}")
    print(f"VAPID_PRIVATE_KEY=<private_key_content>")
    print()
    print("📋 Instructions:")
    print("1. Copy the VAPID_PUBLIC_KEY to your frontend .env file:")
    print("   VITE_VAPID_PUBLIC_KEY=<public_key_here>")
    print()
    print("2. Copy the VAPID_PRIVATE_KEY to your backend .env file:")
    print("   VAPID_PRIVATE_KEY=<private_key_here>")
    print("   VAPID_CLAIM_EMAIL=your-email@example.com")
    print()
    print("⚠️  IMPORTANT: Keep the private key secure and never expose it in client-side code!")
    print()
    print("🔒 Private Key (PEM format - save this securely):")
    print(private_pem.decode('utf-8'))

if __name__ == "__main__":
    generate_vapid_keys()