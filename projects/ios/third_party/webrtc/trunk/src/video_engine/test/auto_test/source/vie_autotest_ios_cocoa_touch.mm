/*
 *  Copyright (c) 2011 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree. An additional intellectual property rights grant can be found
 *  in the file PATENTS.  All contributing project authors may
 *  be found in the AUTHORS file in the root of the source tree.
 */

#include	"engine_configurations.h"

#include	"vie_autotest_ios_cocoa_touch.h"
#include	"vie_autotest_defines.h"
#include	"vie_autotest.h"
#include	"vie_autotest_main.h"

ViEAutoTestWindowManager::ViEAutoTestWindowManager()
{
}

ViEAutoTestWindowManager::~ViEAutoTestWindowManager()
{
}

int ViEAutoTestWindowManager::CreateWindows(AutoTestRect window1Size,
                                            AutoTestRect window2Size,
                                            void* window1Title,
                                            void* window2Title)
{
    return 0;
}

int ViEAutoTestWindowManager::TerminateWindows()
{
    return 0;
}

void* ViEAutoTestWindowManager::GetWindow1()
{
    return (void*)0x01; //TJG - Fakeout! Identity of Window 1 is 0x01
}

void* ViEAutoTestWindowManager::GetWindow2()
{
    return (void*)0x02; //TJG - Fakeout! Identity of Window 2 is 0x02
}

bool ViEAutoTestWindowManager::SetTopmostWindow()
{
    return true;
}

@implementation AutoTestClass

-(void)autoTestWithArg:(NSString*)answerFile
{    
    NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init];
    
    ViEAutoTestMain autoTest;
    
    if(NSOrderedSame != [answerFile compare:@""])
    {
        char answerFileUTF8[1024] = "";
        strcpy(answerFileUTF8, (char*)[answerFileUTF8 UTF8]);
        autoTest.UseAnswerFile(answerFileUTF8);
    }
    
    int success = autoTest.BeginOSIndependentTesting();
    
    [pool release];
    return;
}

@end

int vie_autotest_ios_main(int argc, const char * argv[])
{
    ::testing::InitGoogleTest(&argc, (char**)argv);

    NSAutoreleasePool* pool = [[NSAutoreleasePool alloc] init];

    [UIApplication sharedApplication];

    // we have to run the test in a secondary thread because we need to run a
    // runloop, which blocks
    AutoTestClass* autoTestClass = [[AutoTestClass alloc]init];
    [NSThread detachNewThreadSelector:@selector(autoTestWithArg:)
     toTarget:autoTestClass withObject:nil];

    // process OS events. Blocking call
    [[NSRunLoop mainRunLoop]run];

    [pool release];
}


