#pragma once

class tMouseEvent;
class tTouchEvent;

class tInputManager
:   public tSingleton<tInputManager>,
    public tSubject<const tMouseEvent&>,
    public tSubject<const tTouchEvent&>
{
public:
    tInputManager() { }
};

