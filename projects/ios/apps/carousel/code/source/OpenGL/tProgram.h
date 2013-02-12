#pragma once

class tProgram
{
protected:
    GLuint mProgramID;

public:
    tProgram(const tShader& newVertShader, const tShader& newFragShader);
    ~tProgram();

    bool linkStatus() const;
    bool validate() const;
    
    void setActive();

    std::string getInfoLog() const;

    friend class CarouselApp;
};

