/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

//       Some ideas of improvements:
//       Break out common init and maybe terminate to separate function(s).
//       How much trace should we have enabled?
//       API error counter, to print info and return -1 if any error.

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <time.h>
#include <cassert>
#if defined(_WIN32)
 #include <conio.h>
#endif

#include "voe_stress_test.h"
#include "voe_standard_test.h"

#include "../../source/voice_engine_defines.h"  // defines build macros

#include "thread_wrapper.h"

using namespace webrtc;

namespace voetest {

#define VALIDATE_STRESS(expr)                                   \
    if (expr)                                                   \
    {                                                           \
        printf("Error at line: %i, %s \n", __LINE__, #expr);    \
        printf("Error code: %i \n", base->LastError());  \
    }

#ifdef _WIN32
 // Pause if supported
 #define PAUSE_OR_SLEEP(x) PAUSE;
#else
 // Sleep a bit instead if pause not supported
 #define PAUSE_OR_SLEEP(x) SLEEP(x);
#endif

extern char* GetFilename(char* filename);
extern const char* GetFilename(const char* filename);
extern int GetResource(char* resource, char* dest, int destLen);
extern char* GetResource(char* resource);
extern const char* GetResource(const char* resource);


const char* VoEStressTest::_key = "====YUtFWRAAAAADBtIHgAAAAAEAAAAcAAAAAQBHU0ds"
    "b2JhbCBJUCBTb3VuZAAC\nAAAAIwAAAExpY2Vuc2VkIHRvIE5vcnRlbCBOZXR3cm9rcwAAAAA"
    "xAAAAZxZ7/u0M\niFYyTwSwko5Uutf7mh8S0O4rYZYTFidbzQeuGonuL17F/2oD/2pfDp3jL4"
    "Rf3z/A\nnlJsEJgEtASkDNFuwLILjGY0pzjjAYQp3pCl6z6k2MtE06AirdjGLYCjENpq/opX"
    "\nOrs3sIuwdYK5va/aFcsjBDmlsGCUM48RDYG9s23bIHYafXUC4ofOaubbZPWiPTmL\nEVJ8WH"
    "4F9pgNjALc14oJXfON7r/3\n=EsLx";


int VoEStressTest::DoTest()
{
    int test(-1);
    while (test != 0)
    {
        test = MenuSelection();
        switch (test)
        {
            case 0:
                // Quit stress test
                break;
            case 1:
                // All tests
                StartStopTest();
                CreateDeleteChannelsTest();
                MultipleThreadsTest();
                break;
            case 2:
                StartStopTest();
                break;
            case 3:
                CreateDeleteChannelsTest();
                break;
            case 4:
                MultipleThreadsTest();
                break;
            default:
                // Should not be possible
                printf("Invalid selection! (Test code error)\n");
                assert(false);
        } // switch
    } // while

    return 0;
}


int VoEStressTest::MenuSelection()
{
    printf("------------------------------------------------\n");
    printf("Select stress test\n\n");
    printf(" (0)  Quit\n");
    printf(" (1)  All\n");
    printf("- - - - - - - - - - - - - - - - - - - - - - - - \n");
    printf(" (2)  Start/stop\n");
    printf(" (3)  Create/delete channels\n");
    printf(" (4)  Multiple threads\n");

    const int maxMenuSelection = 4;
    int selection(-1);

    selection = 1;  //TJG
//    while ((selection < 0) || (selection > maxMenuSelection))
//    {
//        printf("\n: ");
//        int retval = scanf("%d", &selection);
//        if ((retval != 1) || (selection < 0) || (selection > maxMenuSelection))
//        {
//            printf("Invalid selection!\n");
//        }
//    }

    return selection;
}


int VoEStressTest::StartStopTest()
{
    printf("------------------------------------------------\n");
    printf("Running start/stop test\n");
    printf("------------------------------------------------\n");

    printf("\nNOTE: this thest will fail after a while if Core audio is used\n");
    printf("because MS returns AUDCLNT_E_CPUUSAGE_EXCEEDED (VoE Error 10013).\n");

    // Get sub-API pointers
    VoEBase* base = _mgr.BasePtr();

    // Set trace
//     VALIDATE_STRESS(base->SetTraceFileName(
//         GetFilename("VoEStressTest_StartStop_trace.txt")));
//     VALIDATE_STRESS(base->SetDebugTraceFileName(
//         GetFilename("VoEStressTest_StartStop_trace_debug.txt")));
//     VALIDATE_STRESS(base->SetTraceFilter(kTraceStateInfo |
//         kTraceWarning | kTraceError |
//         kTraceCritical | kTraceApiCall |
//         kTraceMemory | kTraceInfo));

    VALIDATE_STRESS(base->Init());
    VALIDATE_STRESS(base->CreateChannel());


    ///////////// Start test /////////////

    int numberOfLoops(2000);
    int loopSleep(200);
    int i(0);
    int markInterval(20);

    printf("Running %d loops with %d ms sleep. Mark every %d loop. \n",
        numberOfLoops, loopSleep, markInterval);
    printf("Test will take approximately %d minutes. \n",
           numberOfLoops*loopSleep/1000/60+1);

    for (i=0; i<numberOfLoops; ++i)
    {
        VALIDATE_STRESS(base->SetLocalReceiver(0, 4800));
        VALIDATE_STRESS(base->SetSendDestination(0, 4800, "127.0.0.1"));
        VALIDATE_STRESS(base->StartReceive(0));
        VALIDATE_STRESS(base->StartPlayout(0));
        VALIDATE_STRESS(base->StartSend(0));
        if (!(i % markInterval)) MARK();
        SLEEP(loopSleep);
        VALIDATE_STRESS(base->StopSend(0));
        VALIDATE_STRESS(base->StopPlayout(0));
        VALIDATE_STRESS(base->StopReceive(0));
    }
    ANL();

    VALIDATE_STRESS(base->SetLocalReceiver(0, 4800));
    VALIDATE_STRESS(base->SetSendDestination(0, 4800, "127.0.0.1"));
    VALIDATE_STRESS(base->StartReceive(0));
    VALIDATE_STRESS(base->StartPlayout(0));
    VALIDATE_STRESS(base->StartSend(0));
    printf("Verify that audio is good. \n");
    PAUSE_OR_SLEEP(20000);
    VALIDATE_STRESS(base->StopSend(0));
    VALIDATE_STRESS(base->StopPlayout(0));
    VALIDATE_STRESS(base->StopReceive(0));

    ///////////// End test /////////////


    // Terminate
    VALIDATE_STRESS(base->DeleteChannel(0));
    VALIDATE_STRESS(base->Terminate());

    printf("Test finished \n");

    return 0;
}


int VoEStressTest::CreateDeleteChannelsTest()
{
    printf("------------------------------------------------\n");
    printf("Running create/delete channels test\n");
    printf("------------------------------------------------\n");

    // Get sub-API pointers
    VoEBase* base = _mgr.BasePtr();

    // Set trace
//     VALIDATE_STRESS(base->SetTraceFileName(
//          GetFilename("VoEStressTest_CreateChannels_trace.txt")));
//     VALIDATE_STRESS(base->SetDebugTraceFileName(
//          GetFilename("VoEStressTest_CreateChannels_trace_debug.txt")));
//     VALIDATE_STRESS(base->SetTraceFilter(kTraceStateInfo |
//         kTraceWarning | kTraceError |
//         kTraceCritical | kTraceApiCall |
//         kTraceMemory | kTraceInfo));

    VALIDATE_STRESS(base->Init());

    ///////////// Start test /////////////

    int numberOfLoops(10000);
    int loopSleep(10);
    int i(0);
    int markInterval(200);

    printf("Running %d loops with %d ms sleep. Mark every %d loop. \n",
        numberOfLoops, loopSleep, markInterval);
    printf("Test will take approximately %d minutes. \n",
           numberOfLoops * loopSleep / 1000 / 60 + 1);

    //       Some possible extensions include:
    //       Different sleep times (fixed or random) or zero.
    //       Start call on all or some channels.
    //       Two parts: first have a slight overweight to creating channels,
    //       then to deleting. (To ensure we hit max channels and go to zero.)
    //       Make sure audio is OK after test has finished.

    // Set up, start with maxChannels/2 channels
    const int maxChannels = base->MaxNumOfChannels();
    VALIDATE_STRESS(maxChannels < 1); // Should always have at least one channel
    bool* channelState = new bool[maxChannels];
    memset(channelState, 0, maxChannels*sizeof(bool));
    int channel(0);
    int noOfActiveChannels(0);
    for (i=0; i<(maxChannels/2); ++i)
    {
        channel = base->CreateChannel();
        VALIDATE_STRESS(channel < 0);
        if (channel >= 0)
        {
            channelState[channel] = true;
            ++noOfActiveChannels;
        }
    }
    srand((unsigned int)time(NULL));
    bool action(false);
    double rnd(0.0);
    int res(0);

    // Create/delete channels with slight 
    for (i=0; i<numberOfLoops; ++i)
    {
        // Randomize action (create or delete channel)
        action = rand() <= (RAND_MAX / 2);
        if (action)
        {
            if (noOfActiveChannels < maxChannels)
            {
                // Create new channel
                channel = base->CreateChannel();
                VALIDATE_STRESS(channel < 0);
                if (channel >= 0)
                {
                    channelState[channel] = true;
                    ++noOfActiveChannels;
                }
            }
        }
        else
        {
            if (noOfActiveChannels > 0)
            {
                // Delete random channel that's created [0, maxChannels - 1]
                do
                {
                    rnd = static_cast<double>(rand());
                    channel = static_cast<int>(rnd /
                        (static_cast<double>(RAND_MAX) + 1.0f) * maxChannels);
                } while (!channelState[channel]); // Must find a created channel

                res = base->DeleteChannel(channel);
                VALIDATE_STRESS(0 != res);
                if (0 == res)
                {
                    channelState[channel] = false;
                    --noOfActiveChannels;
                }
            }
        }

        if (!(i % markInterval)) MARK();
        SLEEP(loopSleep);
    }
    ANL();

    delete [] channelState;

    ///////////// End test /////////////


    // Terminate
    VALIDATE_STRESS(base->Terminate()); // Deletes all channels

    printf("Test finished \n");

    return 0;
}


int VoEStressTest::MultipleThreadsTest()
{
    printf("------------------------------------------------\n");
    printf("Running multiple threads test\n");
    printf("------------------------------------------------\n");

    // Get sub-API pointers
    VoEBase* base = _mgr.BasePtr();

    // Set trace
//     VALIDATE_STRESS(base->SetTraceFileName(
//        GetFilename("VoEStressTest_MultipleThreads_trace.txt")));
//     VALIDATE_STRESS(base->SetDebugTraceFileName(
//        GetFilename("VoEStressTest_MultipleThreads_trace_debug.txt")));
//     VALIDATE_STRESS(base->SetTraceFilter(kTraceStateInfo |
//        kTraceWarning | kTraceError |
//        kTraceCritical | kTraceApiCall |
//        kTraceMemory | kTraceInfo));

    // Init
    VALIDATE_STRESS(base->Init());
    VALIDATE_STRESS(base->CreateChannel());


    ///////////// Start test /////////////

    int numberOfLoops(10000);
    int loopSleep(0);
    int i(0);
    int markInterval(1000);

    printf("Running %d loops with %d ms sleep. Mark every %d loop. \n",
        numberOfLoops, loopSleep, markInterval);
    printf("Test will take approximately %d minutes. \n",
           numberOfLoops * loopSleep / 1000 / 60 + 1);

    srand((unsigned int)time(NULL));
    int rnd(0);

    // Start extra thread
    const char* threadName = "StressTest Extra API Thread";
    _ptrExtraApiThread = ThreadWrapper::CreateThread(
        RunExtraApi, this, kNormalPriority, threadName);
    unsigned int id(0);
    VALIDATE_STRESS(!_ptrExtraApiThread->Start(id));

    //       Some possible extensions include:
    //       Add more API calls to randomize
    //       More threads
    //       Different sleep times (fixed or random).
    //       Make sure audio is OK after test has finished.

    // Call random API functions here and in extra thread, ignore any error
    for (i=0; i<numberOfLoops; ++i)
    {
        // This part should be equal to the marked part in the extra thread
        // --- BEGIN ---
        rnd = rand();
        if (rnd < (RAND_MAX / 2))
        {
            // Start playout
            base->StartPlayout(0);
        }
        else
        {
            // Stop playout
            base->StopPlayout(0);
        }
        // --- END ---

        if (!(i % markInterval)) MARK();
        SLEEP(loopSleep);
    }
    ANL();

    // Stop extra thread
    VALIDATE_STRESS(!_ptrExtraApiThread->Stop());
    delete _ptrExtraApiThread;

    ///////////// End test /////////////

    // Terminate
    VALIDATE_STRESS(base->Terminate()); // Deletes all channels

    printf("Test finished \n");

    return 0;
}


// Thread functions

bool VoEStressTest::RunExtraApi(void* ptr)
{
    return static_cast<VoEStressTest*>(ptr)->ProcessExtraApi();
}

bool VoEStressTest::ProcessExtraApi()
{
    // Prepare
    VoEBase* base = _mgr.BasePtr();
    int rnd(0);

    // Call random API function, ignore any error

    // This part should be equal to the marked part in the main thread
    // --- BEGIN ---
    rnd = rand();
    if (rnd < (RAND_MAX / 2))
    {
        // Start playout
        base->StartPlayout(0);
    }
    else
    {
        // Stop playout
        base->StopPlayout(0);
    }
    // --- END ---

    return true;
}

}  //  namespace voetest
