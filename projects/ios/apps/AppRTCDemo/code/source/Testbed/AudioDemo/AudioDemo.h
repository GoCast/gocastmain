#pragma once

#include <queue>

class AudioDemoMessage;

class AudioDemo
: public tMealy,
// public tSubject<const OtherAudioDemoMessage&>,
  public tObserver<const AudioDemoMessage&>
{
protected:

public:
	AudioDemo();
	~AudioDemo();

protected:
	void startEntry();
	void endEntry();
	void invalidStateEntry();

	void showLoginViewEntry();
	void showWebLoadingViewEntry();

	void showLoginViewExit();
	void showWebLoadingViewExit();

public:
	enum EventType
	{
		kInvalidEvent = -2,
		kNext = -1,
		kWebViewLoaded,
	};

	enum StateType
	{
		kInvalidState = 0,
		kStart = 1,
		kEnd,
		kShowLoginView,
		kShowWebLoadingView,
	};

protected:
	void CallEntry();
	void CallExit();
	int  StateTransitionFunction(const int evt) const;
	bool HasEdgeNamedNext() const;

	void update(const AudioDemoMessage& msg);
};

class AudioDemoMessage
{
public:
	AudioDemo::EventType				mEvent;
	tSubject<const AudioDemoMessage&>*	mSource;

public:
	AudioDemoMessage(AudioDemo::EventType newEvent, tSubject<const AudioDemoMessage&>* newSource = NULL)
	: mEvent(newEvent), mSource(newSource) { }
};


