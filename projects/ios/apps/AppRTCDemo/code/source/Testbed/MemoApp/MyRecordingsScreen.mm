#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
MyRecordingsScreen::MyRecordingsScreen()
{
	ConstructMachine();
}

MyRecordingsScreen::~MyRecordingsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void MyRecordingsScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);

    [gAppDelegateInstance setMyRecordingsScreenVisible:true];
}

void MyRecordingsScreen::endEntry()
{
    [gAppDelegateInstance setMyRecordingsScreenVisible:false];
}

void MyRecordingsScreen::idleEntry()
{

}

void MyRecordingsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Actions
void MyRecordingsScreen::updateMyRecordingsTableEntry()
{
    mRecordingsTable = tFile(tFile::kDocumentsDirectory, "").directoryListing();

    [gAppDelegateInstance setMyRecordingsTable:mRecordingsTable];
}

#pragma mark Sending messages to other machines
void MyRecordingsScreen::sendGoPlayToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoPlay, mRecordingsTable[mItemSelected]));
}


#pragma mark State wiring
void MyRecordingsScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kSendGoPlayToVC: sendGoPlayToVCEntry(); break;
		case kStart: startEntry(); break;
		case kUpdateMyRecordingsTable: updateMyRecordingsTableEntry(); break;
		default: break;
	}
}

void MyRecordingsScreen::CallExit()
{
}

int  MyRecordingsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kItemSelected)) return kSendGoPlayToVC; else
	if ((mState == kStart) && (evt == kNext)) return kUpdateMyRecordingsTable; else
	if ((mState == kUpdateMyRecordingsTable) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool MyRecordingsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kStart:
		case kUpdateMyRecordingsTable:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void MyRecordingsScreen::update(const MyRecordingsScreenMessage& msg)
{
	process(msg.mEvent);
}

void MyRecordingsScreen::update(const MemoEvent &msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kTableItemSelected:
            mItemSelected = msg.mItemSelected;
            process(kItemSelected);
            break;

        default:
            break;
    }
}

