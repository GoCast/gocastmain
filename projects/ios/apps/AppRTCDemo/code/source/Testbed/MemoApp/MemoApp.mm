#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

MemoApp gMemoApp;

#pragma mark Constructor / Destructor
MemoApp::MemoApp()
:   mScreen(NULL)
{
	ConstructMachine();
}

MemoApp::~MemoApp()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void MemoApp::startEntry()
{
    tFile(tFile::kDocumentsDirectory, "logintoken.txt").remove();
    MemoEventManager::getInstance()->attach(this);
}

void MemoApp::endEntry()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Screens

void MemoApp::hideAllViewsEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void MemoApp::startScreenEntry()
{
    mScreen = new StartScreen();
    mScreen->attach(this);
    ((StartScreen*)mScreen)->ready();
}

void MemoApp::startScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::myInboxScreenEntry()
{
    mScreen = new MyInboxScreen;
    mScreen->attach(this);
}

void MemoApp::myInboxScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::recordAudioScreenEntry()
{
    mScreen = new RecordAudioScreen;
    mScreen->attach(this);
}

void MemoApp::recordAudioScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::sendToGroupScreenEntry()
{
    mScreen = new SendToGroupScreen(mCurAudioFilename);
    mScreen->attach(this);
}

void MemoApp::sendToGroupScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::playAudioScreenEntry()
{
    mScreen = new PlayAudioScreen(mCurAudioFilename, mExistsOnServer);
    mScreen->attach(this);
}

void MemoApp::playAudioScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::settingsScreenEntry()
{
    mScreen = new SettingsScreen();
    mScreen->attach(this);
}

void MemoApp::settingsScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::versionCheckScreenEntry()
{
    mScreen = new VersionCheckScreen();
    mScreen->attach(this);
}

void MemoApp::versionCheckScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void MemoApp::oldVersionScreenEntry()
{
    [gAppDelegateInstance setOldVersionScreenVisible:true];
}

#pragma mark State wiring
void MemoApp::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kHideAllViews: hideAllViewsEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kMyInboxScreen: myInboxScreenEntry(); break;
		case kOldVersionScreen: oldVersionScreenEntry(); break;
		case kPlayAudioScreen: playAudioScreenEntry(); break;
		case kRecordAudioScreen: recordAudioScreenEntry(); break;
		case kSendToGroupScreen: sendToGroupScreenEntry(); break;
		case kSettingsScreen: settingsScreenEntry(); break;
		case kStart: startEntry(); break;
		case kStartScreen: startScreenEntry(); break;
		case kVersionCheckScreen: versionCheckScreenEntry(); break;
		default: break;
	}
}

void MemoApp::CallExit()
{
	switch(mState)
	{
		case kMyInboxScreen: myInboxScreenExit(); break;
		case kPlayAudioScreen: playAudioScreenExit(); break;
		case kRecordAudioScreen: recordAudioScreenExit(); break;
		case kSendToGroupScreen: sendToGroupScreenExit(); break;
		case kSettingsScreen: settingsScreenExit(); break;
		case kStartScreen: startScreenExit(); break;
		case kVersionCheckScreen: versionCheckScreenExit(); break;
		default: break;
	}
}

int  MemoApp::StateTransitionFunction(const int evt) const
{
	if ((mState == kHideAllViews) && (evt == kNext)) return kVersionCheckScreen; else
	if ((mState == kMyInboxScreen) && (evt == kGoNewRecording)) return kRecordAudioScreen; else
	if ((mState == kMyInboxScreen) && (evt == kGoPlay)) return kPlayAudioScreen; else
	if ((mState == kMyInboxScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoNewRecording)) return kRecordAudioScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoSendGroup)) return kSendToGroupScreen; else
	if ((mState == kPlayAudioScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kRecordAudioScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kRecordAudioScreen) && (evt == kGoSendGroup)) return kSendToGroupScreen; else
	if ((mState == kRecordAudioScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kSendToGroupScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kSendToGroupScreen) && (evt == kGoNewRecording)) return kRecordAudioScreen; else
	if ((mState == kSendToGroupScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoNewRecording)) return kRecordAudioScreen; else
	if ((mState == kSettingsScreen) && (evt == kRestart)) return kVersionCheckScreen; else
	if ((mState == kStart) && (evt == kReady)) return kHideAllViews; else
	if ((mState == kStartScreen) && (evt == kGoInbox)) return kMyInboxScreen; else
	if ((mState == kVersionCheckScreen) && (evt == kFail)) return kOldVersionScreen; else
	if ((mState == kVersionCheckScreen) && (evt == kSuccess)) return kStartScreen;

	return kInvalidState;
}

bool MemoApp::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kHideAllViews:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void MemoApp::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kAppDelegateInit:   process(kReady); break;

        case MemoEvent::kInboxTabPressed:
            if (getState() != kMyInboxScreen)
            {
                process(kGoInbox);
            }
            break;

        case MemoEvent::kNewMemoTabPressed:
            if (getState() != kRecordAudioScreen)
            {
                process(kGoNewRecording);
            }
            break;

        case MemoEvent::kSettingsTabPressed:
            if (getState() != kSettingsScreen)
            {
                process(kGoSettings);
            }
            break;

        default:
            break;
    }
}

void MemoApp::update(const MemoAppMessage& msg)
{
    switch (msg.mEvent)
    {
        case MemoApp::kGoPlay:
            mCurAudioFilename   = msg.mAudioFilename;
            mExistsOnServer     = msg.mExistsOnServer;
            break;
        case MemoApp::kGoSendGroup: mCurAudioFilename = msg.mAudioFilename; break;

        default:
            break;
    }

	process(msg.mEvent);
}

