#include "Base/package.h"
#include "Io/package.h"

#include "package.h"

GoCastTalkApp gGoCastTalkApp;

#pragma mark Constructor / Destructor
GoCastTalkApp::GoCastTalkApp()
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
    delete mTabs[4];
    delete mTabs[3];
    delete mTabs[2];
    delete mTabs[1];
    delete mTabs[0];
}

void GoCastTalkApp::idleEntry()
{
}

void GoCastTalkApp::invalidStateEntry()
{
	assert("Event is invalid for this state" && 0);
}

#pragma mark Tabs

void GoCastTalkApp::createAllTabsEntry()
{
    mTabs[0] = new InboxTab;
    mTabs[1] = new NewMemoTab;
    mTabs[2] = new ContactsTab;
    mTabs[3] = new GroupsTab;
    mTabs[4] = new SettingsTab;

    for (int i = 0; i < 5; i++)
    {
        mTabs[i]->attach(this);
    }

    mTabs[0]->setActiveTab(true);
}

#pragma mark State wiring
void GoCastTalkApp::CallEntry()
{
	switch(mState)
	{
		case kCreateAllTabs: createAllTabsEntry(); break;
		case kEnd: EndEntryHelper(); break;
		case kIdle: idleEntry(); break;
		case kInvalidState: invalidStateEntry(); break;
		case kStart: startEntry(); break;
		default: break;
	}
}

void GoCastTalkApp::CallExit()
{
}

int  GoCastTalkApp::StateTransitionFunction(const int evt) const
{
	if ((mState == kCreateAllTabs) && (evt == kNext)) return kIdle; else
	if ((mState == kStart) && (evt == kReady)) return kCreateAllTabs;

	return kInvalidState;
}

bool GoCastTalkApp::HasEdgeNamedNext() const
{
	switch(mState)
	{
		case kCreateAllTabs:
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
            for(int i = 0; i < 5; i++)
            {
                mTabs[i]->setActiveTab(false);
            }
            mTabs[0]->setActiveTab(true);
            break;

        case GCTEvent::kNewMemoTabPressed:
            for(int i = 0; i < 5; i++)
            {
                mTabs[i]->setActiveTab(false);
            }
            mTabs[1]->setActiveTab(true);
            break;

        case GCTEvent::kContactsTabPressed:
            for(int i = 0; i < 5; i++)
            {
                mTabs[i]->setActiveTab(false);
            }
            mTabs[2]->setActiveTab(true);
            break;

        case GCTEvent::kGroupsTabPressed:
            for(int i = 0; i < 5; i++)
            {
                mTabs[i]->setActiveTab(false);
            }
            mTabs[3]->setActiveTab(true);
            break;

        case GCTEvent::kSettingsTabPressed:
            for(int i = 0; i < 5; i++)
            {
                mTabs[i]->setActiveTab(false);
            }
            mTabs[4]->setActiveTab(true);
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

