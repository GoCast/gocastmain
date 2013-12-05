#pragma once

class GoCastTalkAppMessage;

class Screen : public tSubject<const GoCastTalkAppMessage&>
{
public:
    Screen() { }
    virtual ~Screen() { }
};

