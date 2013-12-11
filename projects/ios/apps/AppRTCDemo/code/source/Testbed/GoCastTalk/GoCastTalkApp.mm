#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

GoCastTalkApp gGoCastTalkApp;

#pragma mark Constructor / Destructor
GoCastTalkApp::GoCastTalkApp()
:   mScreen(NULL)
{
	ConstructMachine();
}

GoCastTalkApp::~GoCastTalkApp()
{
	DestructMachine();
}

#pragma mark Start / End / Invalid
void GoCastTalkApp::startEntry()
{
    tFile(tFile::kDocumentsDirectory, "logintoken.txt").remove();
    GCTEventManager::getInstance()->attach(this);
}

void GoCastTalkApp::endEntry()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void GoCastTalkApp::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Screens

void GoCastTalkApp::hideAllViewsEntry()
{
    [gAppDelegateInstance hideAllViews];
}

void GoCastTalkApp::startScreenEntry()
{
//    mScreen = new StartScreen();
//    mScreen->attach(this);
//    ((StartScreen*)mScreen)->ready();

    SetImmediateEvent(kGoInbox);
}

void GoCastTalkApp::startScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void GoCastTalkApp::inboxScreenEntry()
{
    mScreen = new InboxScreen;
    mScreen->attach(this);
}

void GoCastTalkApp::inboxScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void GoCastTalkApp::newMemoScreenEntry()
{
    mScreen = new NewMemoScreen;
    mScreen->attach(this);
}

void GoCastTalkApp::newMemoScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void GoCastTalkApp::contactsScreenEntry()
{
    mScreen = new ContactsScreen();
    mScreen->attach(this);
}

void GoCastTalkApp::contactsScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void GoCastTalkApp::groupsScreenEntry()
{
    mScreen = new GroupsScreen;
    mScreen->attach(this);
}

void GoCastTalkApp::groupsScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

void GoCastTalkApp::settingsScreenEntry()
{
    mScreen = new SettingsScreen();
    mScreen->attach(this);
}

void GoCastTalkApp::settingsScreenExit()
{
    if (mScreen) { delete mScreen; mScreen = NULL; }
}

#pragma mark State wiring
void GoCastTalkApp::CallEntry()
{
	switch(mState)
	{
		case kContactsScreen: contactsScreenEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kGroupsScreen: groupsScreenEntry(); break;
		case kHideAllViews: hideAllViewsEntry(); break;
		case kInboxScreen: inboxScreenEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kNewMemoScreen: newMemoScreenEntry(); break;
		case kSettingsScreen: settingsScreenEntry(); break;
		case kStart: startEntry(); break;
		case kStartScreen: startScreenEntry(); break;
		default: break;
	}
}

void GoCastTalkApp::CallExit()
{
	switch(mState)
	{
		case kContactsScreen: contactsScreenExit(); break;
		case kGroupsScreen: groupsScreenExit(); break;
		case kInboxScreen: inboxScreenExit(); break;
		case kNewMemoScreen: newMemoScreenExit(); break;
		case kSettingsScreen: settingsScreenExit(); break;
		case kStartScreen: startScreenExit(); break;
		default: break;
	}
}

int  GoCastTalkApp::StateTransitionFunction(const int evt) const
{
	if ((mState == kContactsScreen) && (evt == kGoContacts)) return kContactsScreen; else
	if ((mState == kContactsScreen) && (evt == kGoGroups)) return kGroupsScreen; else
	if ((mState == kContactsScreen) && (evt == kGoInbox)) return kInboxScreen; else
	if ((mState == kContactsScreen) && (evt == kGoNewMemo)) return kNewMemoScreen; else
	if ((mState == kContactsScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kGroupsScreen) && (evt == kGoContacts)) return kContactsScreen; else
	if ((mState == kGroupsScreen) && (evt == kGoGroups)) return kGroupsScreen; else
	if ((mState == kGroupsScreen) && (evt == kGoInbox)) return kInboxScreen; else
	if ((mState == kGroupsScreen) && (evt == kGoNewMemo)) return kNewMemoScreen; else
	if ((mState == kGroupsScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kHideAllViews) && (evt == kNext)) return kStartScreen; else
	if ((mState == kInboxScreen) && (evt == kGoContacts)) return kContactsScreen; else
	if ((mState == kInboxScreen) && (evt == kGoGroups)) return kGroupsScreen; else
	if ((mState == kInboxScreen) && (evt == kGoInbox)) return kInboxScreen; else
	if ((mState == kInboxScreen) && (evt == kGoNewMemo)) return kNewMemoScreen; else
	if ((mState == kInboxScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kNewMemoScreen) && (evt == kGoContacts)) return kContactsScreen; else
	if ((mState == kNewMemoScreen) && (evt == kGoGroups)) return kGroupsScreen; else
	if ((mState == kNewMemoScreen) && (evt == kGoInbox)) return kInboxScreen; else
	if ((mState == kNewMemoScreen) && (evt == kGoNewMemo)) return kNewMemoScreen; else
	if ((mState == kNewMemoScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoContacts)) return kContactsScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoGroups)) return kGroupsScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoInbox)) return kInboxScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoNewMemo)) return kNewMemoScreen; else
	if ((mState == kSettingsScreen) && (evt == kGoSettings)) return kSettingsScreen; else
	if ((mState == kStart) && (evt == kReady)) return kHideAllViews; else
	if ((mState == kStartScreen) && (evt == kGoInbox)) return kInboxScreen;

	return kInvalidState;
}

bool GoCastTalkApp::HasEdgeNamedNext() const
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
void GoCastTalkApp::update(const GCTEvent& msg)
{
    switch (msg.mEvent)
    {
        case GCTEvent::kAppDelegateInit:   process(kReady); break;

        case GCTEvent::kInboxTabPressed:
            process(kGoInbox);
            break;

        case GCTEvent::kNewMemoTabPressed:
            process(kGoNewMemo);
            break;

        case GCTEvent::kContactsTabPressed:
            process(kGoContacts);
            break;

        case GCTEvent::kGroupsTabPressed:
            process(kGoGroups);
            break;

        case GCTEvent::kSettingsTabPressed:
            process(kGoSettings);
            break;

        default:
            break;
    }
}

void GoCastTalkApp::update(const GoCastTalkAppMessage& msg)
{
    switch (msg.mEvent)
    {
        default:
            break;
    }

	process(msg.mEvent);
}

