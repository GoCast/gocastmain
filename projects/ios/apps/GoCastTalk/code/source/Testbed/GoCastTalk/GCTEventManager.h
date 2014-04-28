#pragma once

class GCTEvent;

class GCTEventManager
:   public tSingleton<GCTEventManager>,
    public tSubject<const GCTEvent&>
{
protected:
    GCTEventManager() { }

    friend class tSingleton<GCTEventManager>;
};

