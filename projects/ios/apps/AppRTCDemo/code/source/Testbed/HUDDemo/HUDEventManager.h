#pragma once

class HUDEvent;

class HUDEventManager
:   public tSingleton<HUDEventManager>,
    public tSubject<const HUDEvent&>
{
public:
    HUDEventManager() { }

    friend class tSingleton<HUDEventManager>;
};

