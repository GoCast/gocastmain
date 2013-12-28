#pragma once

class GoCastTalkAppMessage;

class Tab : public tSubject<const GoCastTalkAppMessage&>
{
protected:
    bool mActiveTab;

public:
    Tab()
    : mActiveTab(false) { }
    virtual ~Tab() { }

    void setActiveTab(bool newActive)
    {
        mActiveTab = newActive;
    }
};

