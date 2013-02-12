#pragma once

class CallcastEvent;
class WhiteboardEvent;

class CarouselEventManager
:   public tSingleton<CarouselEventManager>,
    public tSubject<const CallcastEvent&>,
    public tSubject<const WhiteboardEvent&>
{
public:
    CarouselEventManager() { }
};

