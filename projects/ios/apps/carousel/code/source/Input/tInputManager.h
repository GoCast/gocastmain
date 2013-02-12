#pragma once

class tTouchEvent;

class tInputManager
:   public tSingleton<tInputManager>,
    public tSubject<const tTouchEvent&>
{
public:
    tInputManager() { }
};

