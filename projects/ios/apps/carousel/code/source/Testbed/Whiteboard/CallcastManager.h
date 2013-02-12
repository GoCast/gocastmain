#pragma once

class CallcastEvent;
class WhiteboardEvent;

class CallcastManager
:   public tSingleton<CallcastManager>,
    public tSubject<const CallcastEvent&>,
    public tSubject<const WhiteboardEvent&>
{
public:
    CallcastManager() { }
};

