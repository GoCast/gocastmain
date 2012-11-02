//
// Cryptographic support functions for GoCast plug-in
// Copyright 2012, GoCast.it Inc - Author: Robert Wolff (rwolff@gocast.it)
//

//
// Compilation needs to point -I at the tropicssl parent directory and also
// needs to link with the libtropicssl.a via -L -l or other method.
//

#include <string.h>
#include <stdlib.h>
#include <stdio.h>
#include <ctype.h>

#include "tropicssl/net.h"
#include "tropicssl/ssl.h"
#include "tropicssl/havege.h"
#include "tropicssl/timing.h"
#include "tropicssl/certs.h"
#include "tropicssl/rsa.h"

//#define SPECIALSAUCE
#ifdef SPECIALSAUCE
//
// \brief h1 is a plug-in 'secret' routine callable by Javascript used to aid in
//      confounding would-be thieves of our servers.
//      These items shall not be called or included in the open source implementation.
//
// \param pStr - inbound string of any length.
// \param len - length of the input buffer. Allowed to be up to 64k arbitrarily.
// \param pOut - buffer where output shall be stored. REQUIRED to be 20 characters in length
// \returns an integer - 0 is success.
//
#define PREPSTR "aabbcdef"
void dump(const unsigned char* mem, unsigned int len) {
    int i;
    char ascii[20];
    char spaces[80];

    memset(ascii, 0, 20);       // A temporary home for printable ascii characters.
    memset(spaces, ' ', 80);    // Make a bunch of spaces for buffering later on.

    for (i=0; i < len; i++)
    {
        printf("%02X ", mem[i]);

        if (isprint(mem[i]))
            ascii[i % 16] = mem[i];
        else
            ascii[i % 16] = '.';        // Filler for non-printable characters.

        // Only want to wrap when we're on the last go-round or when we're mod-16
        if (i == len-1 || (i % 16) == 15)
        {
            // Now - based on how many we've printed, we need to 'buffer' spaces in the printout.
            spaces[(15 - (i % 16)) * 3] = 0;   // insert a 'null'
            printf("%s", spaces);
            spaces[(15 - (i % 16)) * 3] = ' ';

            // Time to wrap or end it.
            printf("-- %s\n", ascii);
            memset(ascii, 0, 20);   // Now reset it for the next line back to nulls.
        }
    }

}

int h1(const unsigned char* pStr, unsigned int len, unsigned char* pOut) {
    if (!pStr || !pOut || len == 0 || len > 64*1024)
        return -1;

    unsigned char* pUse;
    int lenp;

    lenp = strlen(PREPSTR);
    pUse = (unsigned char*)malloc(len + lenp);
    if (!pUse)
        return -2;

//    dump(pStr, len);
    // pre-prep the string inbound with a minor modification.
    // Otherwise, the sha1 hash would be obvious in->out.
    memcpy(pUse, PREPSTR, lenp);
    memcpy(pUse + lenp, pStr, len);

//    dump(pUse, len + lenp);

    sha1(pUse, len + lenp, pOut);

//    dump(pOut, 20);

    free(pUse);

    return 0;
}

#endif

//#define TESTIT
#ifdef TESTIT
#define H "hello"
#define V "aabbcdefhello"
int main(int argc, char** argv)
{
    unsigned char out[20];
    unsigned char second[7] = { 0xde, 0xad, 0xbe, 0xef, 0x00, 0x01, 0x02 };

    h1((unsigned char*)H, strlen(H), out);
    dump(out, 20);

    printf("\nValidate:\n");
    memset(out, 0, 20);
    sha1((unsigned char*)V, strlen(V), out);
    dump(out, 20);

    printf("\nNext one.\n\n");
    h1(second, 7, out);
    dump(out, 20);

    return 0;
}
#endif

