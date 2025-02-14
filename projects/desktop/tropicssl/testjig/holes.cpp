//
// Cryptographic support functions for GoCast plug-in
// Copyright 2012, GoCast.it Inc - Author: Robert Wolff (rwolff@gocast.it)
//

// Initially a testbed to ensure interop with tropicalssl library and openssl libraries.

//
// need to enable reading a public and private key file which was generated by openssl via:
// openssl genrsa -out privkey.pem 1024
// openssl rsa -in privkey.pem -pubout >pubkey.pem
//

#include <string.h>
#include <stdlib.h>
#include <stdio.h>

#include "tropicssl/net.h"
#include "tropicssl/ssl.h"
#include "tropicssl/havege.h"
#include "tropicssl/timing.h"
#include "tropicssl/certs.h"
#include "tropicssl/rsa.h"

#define PRIVATEKEYFILE "privkey.pem"

#define MESSAGE "This is a test.\n"

rsa_context privrsa;

unsigned char rsa_ciphertext[2048];  // Arbitrary length at the moment.
unsigned char hash[20];  // 160  bits worth


int main(int argc, char** argv) {
int ret;
FILE* fp;

    // Assumes no private key password
    ret = x509parse_keyfile(&privrsa, (char*)PRIVATEKEYFILE, NULL);
    if (ret != 0) {
            printf("  !  x509parse_keyfile returned %d\n\n", ret);
            return -1;
    }

    if (rsa_check_pubkey(&privrsa) != 0 || rsa_check_privkey(&privrsa) != 0) {
        printf("public/private key validation failed.\n");
        return -2;
    }

    printf("Private/Public key loaded. Encrypting message.\n");

    if (rsa_pkcs1_encrypt(&privrsa, RSA_PUBLIC, strlen(MESSAGE),
                  (unsigned char*)MESSAGE, rsa_ciphertext) != 0) {
            printf("Encryption of message failed\n");

        return -3;
    }

    printf("Encryption complete. Output in message.crypt\n");

    fp  = fopen("message.crypt", "wb");
    if (!fp) {
        printf("Error opening message.crypt\n");

        return -4;
    }

    fwrite(rsa_ciphertext, 128, 1, fp);
    fclose(fp);

    memset(&rsa_ciphertext, 0, sizeof(rsa_ciphertext));

    // Now sign the message.
    sha1((unsigned char*)MESSAGE, strlen(MESSAGE), hash);
//    for (int i = 0; i < 20; i++)
//        printf("%02X%s", hash[i], (i + 1) % 16 == 0 ? "\r\n" : " ");

//    if (rsa_pkcs1_sign(&privrsa, RSA_PRIVATE, RSA_SHA1, 20, hash, rsa_ciphertext) != 0) {
    if (rsa_pkcs1_sign(&privrsa, RSA_PRIVATE, RSA_SHA1, 20, hash, rsa_ciphertext) != 0) {
        printf("Signature failed.\n");

        return -5;
    }

    printf("Signing complete. Output in message.sig\n");

    fp  = fopen("message.sig", "wb");
    if (!fp) {
        printf("Error opening message.sig\n");

        return -4;
    }

    fwrite(rsa_ciphertext, 128, 1, fp);
    fclose(fp);


    return 0;
}

