#pragma once

class GoCastTalkAppMessage;

class Screen : public tSubject<const GoCastTalkAppMessage&>
{
protected:
    bool mActiveTab;

public:
    Screen()
    : mActiveTab(false) { }
    virtual ~Screen() { }

    void setActiveTab(bool newActive)
    {
        mActiveTab = newActive;
    }
};

