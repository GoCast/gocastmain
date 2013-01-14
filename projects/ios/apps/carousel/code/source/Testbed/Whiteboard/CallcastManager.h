#pragma once

class CallcastEvent;

class CallcastManager
:   public tSingleton<CallcastManager>,
    public tSubject<const CallcastEvent&>
{
public:
    CallcastManager() { }
};

