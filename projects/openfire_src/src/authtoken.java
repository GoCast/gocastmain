    /**
     *
     * This method sets the authToken in cache
     * @param authToken the random alphanumeric string
     * @param username  the login username
     *
     */
    public void setAuthToken(String authToken, String username)
    {
        authTokenCache.put(authToken, username);
    }
    /**
     *
     * This method gets the authToken from  cache
     * @param authToken the random alphanumeric string
     * @return username  the login username
     *
     */
    public String getAuthToken(String authToken)
    {
        return authTokenCache.get(authToken);
    }
    /**
     *
     * This method removes the authToken from  cache
     * @param authToken the random alphanumeric string
     * @return username  the login username
     *
     */
    public void removeAuthToken(String authToken)
    {
        authTokenCache.remove(authToken);
    }
