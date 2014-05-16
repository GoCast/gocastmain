#include "Base/package.h"
#include "Io/package.h"
#include "Audio/package.h"

#include "package.h"

#include "ChangeLanguageVC.h"

#define kScreenName "ChangeLanguage"

#pragma mark Constructor / Destructor
ChangeLanguageScreen::ChangeLanguageScreen(ChangeLanguageVC* newVC)
: mPeer(newVC)
{
	ConstructMachine();
}

ChangeLanguageScreen::~ChangeLanguageScreen()
{
	DestructMachine();
}

#pragma mark Public methods
void ChangeLanguageScreen::englishPressed()
{
    update(kEnglishSelected);
}

void ChangeLanguageScreen::japanesePressed()
{
    update(kJapaneseSelected);
}

#pragma mark Start / End / Invalid
void ChangeLanguageScreen::startEntry()
{
    GoogleAnalytics::getInstance()->trackScreenEntry(kScreenName);

    GCTEventManager::getInstance()->attach(this);
}

void ChangeLanguageScreen::endEntry()
{
}

void ChangeLanguageScreen::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Idling
void ChangeLanguageScreen::idleEntry()
{
}

#pragma mark Peer communication
void ChangeLanguageScreen::peerPopSelfEntry()
{
    [mPeer popSelf];
}

#pragma mark Actions
void ChangeLanguageScreen::setLanguageToEnglishEntry()
{
    I18N::getInstance()->setLocale("en");
}

void ChangeLanguageScreen::setLanguageToJapaneseEntry()
{
    I18N::getInstance()->setLocale("ja");
}

#pragma mark State wiring
void ChangeLanguageScreen::CallEntry()
{
	switch(mState)
	{
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kPeerPopSelf: peerPopSelfEntry(); break;
		case kSetLanguageToEnglish: setLanguageToEnglishEntry(); break;
		case kSetLanguageToJapanese: setLanguageToJapaneseEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void ChangeLanguageScreen::CallExit()
{
}

int  ChangeLanguageScreen::StateTransitionFunction(const int evt) const
{
	if ((mState == kIdle) && (evt == kEnglishSelected)) return kSetLanguageToEnglish; else
	if ((mState == kIdle) && (evt == kJapaneseSelected)) return kSetLanguageToJapanese; else
	if ((mState == kSetLanguageToEnglish) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kSetLanguageToJapanese) && (evt == kNext)) return kPeerPopSelf; else
	if ((mState == kStart) && (evt == kNext)) return kIdle;

	return kInvalidState;
}

bool ChangeLanguageScreen::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kSetLanguageToEnglish:
		case kSetLanguageToJapanese:
		case kStart:
			return true;
		default: break;
	}
	return false;
}

#pragma mark Messages
void ChangeLanguageScreen::update(const ChangeLanguageScreenMessage& msg)
{
    switch (msg.mEvent)
    {
        case kEnglishSelected:  GoogleAnalytics::getInstance()->trackButton(kScreenName, "kEnglishSelected"); break;
        case kJapaneseSelected: GoogleAnalytics::getInstance()->trackButton(kScreenName, "kJapaneseSelected"); break;
        default: break;
    }

	process(msg.mEvent);
}

void ChangeLanguageScreen::update(const GCTEvent& msg)
{
#pragma unused(msg)

//    switch (getState())
//    {
//        case kShowSomething:
//            switch(msg.mEvent)
//            {
//                case GCTEvent::kOKYesAlertPressed:  update(kYes); break;
//                case GCTEvent::kNoAlertPressed:     update(kNo); break;
//
//                default:
//                    break;
//            }
//            break;
//
//        default:
//            break;
//    }
}
