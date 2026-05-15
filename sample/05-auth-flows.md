# Authentication Flows

This document covers the authentication-related flows: password reset and OAuth-based login via a third-party provider.

## Password Reset

The user requests a reset link, which is sent by the email service. The link contains a signed token that allows the user to set a new password without knowing the old one.

```mermaid
sequenceDiagram
    %% @desc User: User who has forgotten their password
    %% @desc AuthService: Handles authentication and token issuance
    %% @desc UserDB: Stores user credentials and profiles
    %% @desc EmailService: Sends transactional emails
    actor User
    participant AuthService as Auth Service
    participant UserDB as User Database
    participant EmailService as Email Service

    User->>AuthService: POST /password/forgot (email)
    AuthService->>UserDB: SELECT user WHERE email = ?
    UserDB-->>AuthService: User record
    AuthService->>AuthService: Generate signed reset token (TTL 1h)
    AuthService->>UserDB: UPDATE user SET reset_token = ?
    UserDB-->>AuthService: OK
    AuthService->>EmailService: sendPasswordReset(email, token)
    EmailService-->>AuthService: Queued
    AuthService-->>User: 200 OK (check your email)

    User->>AuthService: POST /password/reset (token, newPassword)
    AuthService->>UserDB: SELECT user WHERE reset_token = ?
    UserDB-->>AuthService: User record (token not expired)
    AuthService->>AuthService: Hash new password with bcrypt
    AuthService->>UserDB: UPDATE user SET password_hash = ?, reset_token = NULL
    UserDB-->>AuthService: Updated
    AuthService-->>User: 200 OK (password changed)
```

## OAuth Login

Allows users to log in using a third-party OAuth 2.0 provider (e.g. Google). The provider authenticates the user and returns an authorization code that the backend exchanges for a profile.

```mermaid
sequenceDiagram
    %% @desc User: User initiating OAuth login
    %% @desc AuthService: Handles authentication and token issuance
    %% @desc OAuthProvider: Third-party OAuth 2.0 provider (e.g. Google)
    %% @desc UserDB: Stores user credentials and profiles
    %% @desc SessionStore: Redis cache for active session tokens
    actor User
    participant AuthService as Auth Service
    participant OAuthProvider as OAuth Provider
    participant UserDB as User Database
    participant SessionStore as Session Store

    User->>AuthService: GET /auth/oauth/google
    AuthService-->>User: Redirect to provider consent screen
    User->>OAuthProvider: Grant permissions
    OAuthProvider-->>User: Redirect to /auth/oauth/callback?code=xyz
    User->>AuthService: GET /auth/oauth/callback?code=xyz
    AuthService->>OAuthProvider: POST /token (code, clientSecret)
    OAuthProvider-->>AuthService: { accessToken, idToken }
    AuthService->>OAuthProvider: GET /userinfo (accessToken)
    OAuthProvider-->>AuthService: { email, name, sub }
    AuthService->>UserDB: UPSERT user WHERE oauth_sub = ?
    UserDB-->>AuthService: User record (created or found)
    AuthService->>SessionStore: SET session:{token} user_id TTL 24h
    SessionStore-->>AuthService: OK
    AuthService-->>User: 302 Redirect /dashboard (Set-Cookie: token)
```
