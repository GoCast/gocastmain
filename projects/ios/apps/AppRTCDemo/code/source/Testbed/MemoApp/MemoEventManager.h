#pragma once

class MemoEvent;

class MemoEventManager
:   public tSingleton<MemoEventManager>,
    public tSubject<const MemoEvent&>
{
protected:
    MemoEventManager() { }

    friend class tSingleton<MemoEventManager>;
};

