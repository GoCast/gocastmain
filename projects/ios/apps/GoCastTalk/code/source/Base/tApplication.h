#pragma once

class tApplicationEvent;

class tApplication
:   public tSingleton<tApplication>,
    public tSubject<const tApplicationEvent&>
{
protected:
    bool mSuspended;
    bool mRunning;

protected:
    tApplication();

public:
    void suspend();
    void resume();

    void quit();

    friend class tSingleton<tApplication>;
};

