#pragma once

class MemoAppMessage;

class Screen : public tSubject<const MemoAppMessage&>
{
public:
    Screen() { }
    virtual ~Screen() { }
};

