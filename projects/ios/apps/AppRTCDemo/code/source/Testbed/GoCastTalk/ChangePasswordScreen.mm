#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ChangePasswordVC.h"

#pragma mark Constructor / Destructor
ChangePasswordScreen::ChangePasswordScreen(ChangePasswordVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

ChangePasswordScreen::~ChangePasswordScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void ChangePasswordScreen::savePressed()
{
    process(kSaveSelected);
}

#pragma mark Start / End / Invalid
void ChangePasswordScreen::startEntry()
{
}

void ChangePasswordScreen::endEntry()
{
}

void ChangePasswordScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void ChangePasswordScreen::idleEntry()
{
}

#pragma mark Peer communication
void ChangePasswordScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark UI
void ChangePasswordScreen::showNotYetImplementdEntry()
{
    //"Not yet implemented"
    tAlert("現在未実装です");
}

#pragma mark State wiring
void ChangePasswordScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kShowNotYetImplementd: showNotYetImplementdEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void ChangePasswordScreen::CallExit()
{
}

int  ChangePasswordScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kSaveSelected)) return kShowNotYetImplementd; else
	if ((mState == kPeerPopSelf) && (evt == kNext)) return kIdle; else
	if ((mState == kShowNotYetImplementd) && (evt == kNo)) return kIdle; else
	if ((mState == kShowNotYetImplementd) && (evt == kYes)) return kIdle; else
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool ChangePasswordScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kPeerPopSelf:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void ChangePasswordScreen::update(const ChangePasswordScreenMessage& msg)
{
	process(msg.mEvent);
}

void ChangePasswordScreen::update(const GCTEvent& msg)
{
    switch (getState())
    {
        case kShowNotYetImplementd:
            switch(msg.mEvent)
        {
            case GCTEvent::kOKYesAlertPressed:  process(kYes); break;
            case GCTEvent::kNoAlertPressed:     process(kNo); break;

            default:
                break;
        }
            break;

        default:
            break;
    }
}
