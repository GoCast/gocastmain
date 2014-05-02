#pragma once

class GoogleAnalytics
: public tSingleton<GoogleAnalytics>
{
protected:

protected:
    GoogleAnalytics();

public:
    void trackScreenEntry(const std::string& screenName);
    void trackAction(const std::string& screenName, const std::string& category, const std::string& action, const std::string& label);

    void trackEvent(const std::string& screenName, const std::string& label);

    void trackButton(const std::string& screenName, const std::string& label);

    void trackAlert(const std::string& screenName, const std::string& label);
    void trackAlertOkay(const std::string& screenName, const std::string& label);

    void trackConfirm(const std::string& screenName, const std::string& label);
    void trackConfirmYes(const std::string& screenName, const std::string& label);
    void trackConfirmNo(const std::string& screenName, const std::string& label);

    friend class tSingleton<GoogleAnalytics>;
};

