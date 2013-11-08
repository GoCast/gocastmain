#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
MyGroupsScreen::MyGroupsScreen()
{
	ConstructMachine();
}

MyGroupsScreen::~MyGroupsScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void MyGroupsScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setMyGroupsScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Groups"];
}

void MyGroupsScreen::endEntry()
{
    [gAppDelegateInstance setMyGroupsScreenVisible:false];
}

void MyGroupsScreen::idleEntry()
{
}

void MyGroupsScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark User Interface
void MyGroupsScreen::showReallyDeleteEntry()
{
    tConfirm("Really delete this group?");
}

#pragma mark Sending messages to other machines

void MyGroupsScreen::sendGoEditGroupToVCEntry()
{
    this->tSubject<const MemoAppMessage&>::notify(MemoAppMessage(MemoApp::kGoEditGroup));
}

#pragma mark State wiring
void MyGroupsScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kSendGoEditGroupToVC: sendGoEditGroupToVCEntry(); break;
		case kShowReallyDelete: showReallyDeleteEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void MyGroupsScreen::CallExit()
{
}

int  MyGroupsScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kAdd)) return kSendGoEditGroupToVC; else
	if ((mState == kIdle) && (evt == kDelete)) return kShowReallyDelete; else
	if ((mState == kIdle) && (evt == kEdit)) return kSendGoEditGroupToVC; else
	if ((mState == kShowReallyDelete) && (evt == kNo)) return kIdle; else
	if ((mState == kShowReallyDelete) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool MyGroupsScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void MyGroupsScreen::update(const MyGroupsScreenMessage& msg)
{
	process(msg.mEvent);
}

void MyGroupsScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
        case MemoEvent::kAddGroupPressed:       process(kAdd); break;
        case MemoEvent::kEditGroupPressed:      process(kEdit); break;
        case MemoEvent::kDeleteGroupPressed:    process(kDelete); break;

        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
        case MemoEvent::kNoAlertPressed: process(kNo); break;

        default:
            break;
    }
}

void MyGroupsScreen::update(const URLLoaderEvent& msg)
{
#pragma unused(msg)
    [gAppDelegateInstance setBlockingViewVisible:false];

//    switch (msg.mEvent)
//    {
//        case URLLoaderEvent::kLoadFail: process(kFail); break;
//        case URLLoaderEvent::kLoadedString:
//        {
//            switch (getState())
//            {
//                default:
//                    break;
//            }
//            process(kSuccess);
//        }
//            break;
//
//        case URLLoaderEvent::kLoadedFile: process(kSuccess); break;
//            
//        default:
//            break;
//    }
}

