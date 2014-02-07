#pragma once

class GCTEvent
{
public:
    enum EventType
    {
        kAppDelegateInit,

        kInboxTabPressed,
        kNewMemoTabPressed,
        kContactsTabPressed,
        kGroupsTabPressed,
        kSettingsTabPressed,

//--
        kOKYesAlertPressed,
        kNoAlertPressed,
//--
        kTranscriptFinished,
        kReloadInbox,
        kAppendNewContact,
    };

    EventType   mEvent;
    std::string mTranscription;
    std::string mContact;
    tUInt32     mItemSelected;
    void*       mIdentifier;

    GCTEvent(EventType evt)
    : mEvent(evt) { }
    GCTEvent(EventType evt, tUInt32 newItemSelected)
    : mEvent(evt), mItemSelected(newItemSelected) { }
    GCTEvent(EventType evt, const std::string& newTranscription)
    : mEvent(evt), mTranscription(newTranscription), mContact(newTranscription) { }
    GCTEvent(EventType evt, const std::string& newTranscription, void* newIdentifier)
    : mEvent(evt), mContact(newTranscription), mIdentifier(newIdentifier) { }
};

