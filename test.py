from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
from Crypto.Random import get_random_bytes
import base64

# Generate a random key (keep it secure and store it safely)
key = get_random_bytes(32)  # AES-256 requires a 32-byte key

# Encrypt data
def encrypt_data(data):
    cipher = AES.new(key, AES.MODE_CBC)
    ct_bytes = cipher.encrypt(pad(data.encode(), AES.block_size))
    iv = base64.b64encode(cipher.iv).decode('utf-8')
    ct = base64.b64encode(ct_bytes).decode('utf-8')
    return iv, ct

# Decrypt data
def decrypt_data(iv, ct):
    iv = base64.b64decode(iv)
    ct = base64.b64decode(ct)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    pt = unpad(cipher.decrypt(ct), AES.block_size).decode('utf-8')
    return pt

# Example usage
iv, encrypted_data = encrypt_data('Sensitive Information')
print(f'Encrypted: {encrypted_data}')

decrypted_data = decrypt_data(iv, encrypted_data)
print(f'Decrypted: {decrypted_data}')