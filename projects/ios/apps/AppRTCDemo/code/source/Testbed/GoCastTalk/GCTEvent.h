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

        kOKYesAlertPressed,
        kNoAlertPressed,

        kTableItemSelected,
        kTableItemDeleted,

        kNavButtonPressed,
        kAddContactsButtonPressed,
        kAddGroupsButtonPressed,
    };

    EventType   mEvent;
    tUInt32     mItemSelected;

    GCTEvent(EventType evt)
    : mEvent(evt) { }
    GCTEvent(EventType evt, tUInt32 newItemSelected)
    : mEvent(evt), mItemSelected(newItemSelected) { }
};

