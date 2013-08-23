#pragma once

class tMouseEvent;
class tKeyboardEvent;
class tTouchEvent;
class tOrientationEvent;

class tInputManager
:   public tSingleton<tInputManager>,
    public tSubject<const tMouseEvent&>,
    public tSubject<const tKeyboardEvent&>,
    public tSubject<const tTouchEvent&>,
    public tSubject<tOrientationEvent&>
{
protected:
    tInputManager() { }

    friend class tSingleton<tInputManager>;
};

