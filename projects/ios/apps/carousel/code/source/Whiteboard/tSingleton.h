#pragma once

//Apparently this is called a "Meyers Singleton".
//I templatized it -- TJG 2012-06-23

template<typename T>
class tSingleton
{
public:
    tSingleton() { }         //This is threadsafe in gcc, no mutex required

    static T* getInstance()
    {
        static T mInstance;
        return &mInstance;
    }
};

