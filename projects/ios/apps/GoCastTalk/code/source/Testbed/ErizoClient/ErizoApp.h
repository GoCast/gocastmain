#pragma once

class ErizoApp
: public tObserver<const GUIEvent&>
{
protected:
    ErizoClient mClient;
    bool        mFirstTime;

public:
	ErizoApp();
	~ErizoApp();

public:
    void update(const GUIEvent& newEvent);
};

