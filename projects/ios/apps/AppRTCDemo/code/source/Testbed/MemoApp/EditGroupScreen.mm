#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

#pragma mark Constructor / Destructor
EditGroupScreen::EditGroupScreen()
{
	ConstructMachine();
}

EditGroupScreen::~EditGroupScreen()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void EditGroupScreen::startEntry()
{
    MemoEventManager::getInstance()->attach(this);
    URLLoader::getInstance()->attach(this);

    [gAppDelegateInstance setEditGroupScreenVisible:true];
    [gAppDelegateInstance setNavigationBarTitle:"Edit Group"];
}

void EditGroupScreen::endEntry()
{
    [gAppDelegateInstance setEditGroupScreenVisible:false];
}

void EditGroupScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

void EditGroupScreen::idleEntry()
{

}

#pragma mark State wiring
void EditGroupScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void EditGroupScreen::CallExit()
{
}

int  EditGroupScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool EditGroupScreen::HasEdgeNamedNext() const
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
void EditGroupScreen::update(const EditGroupScreenMessage& msg)
{
	process(msg.mEvent);
}

void EditGroupScreen::update(const MemoEvent& msg)
{
    switch (msg.mEvent)
    {
//        case MemoEvent::kOKYesAlertPressed: process(kYes); break;
//        case MemoEvent::kNoAlertPressed: process(kNo); break;

        default:
            break;
    }
}

void EditGroupScreen::update(const URLLoaderEvent& msg)
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

