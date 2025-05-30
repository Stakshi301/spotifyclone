import NextAuth from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import fetch from "node-fetch";

async function refreshAccessToken(token) {
    try {
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", token.refreshToken);

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                Authorization: "Basic " + Buffer.from(
                    process.env.SPOTIFY_CLIENT_ID + ":" + process.env.SPOTIFY_CLIENT_SECRET
                ).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        });

        const refreshedToken = await response.json();
        console.log("Refreshed Token", refreshedToken);

        return {
            ...token,
            accessToken: refreshedToken.access_token,
            accessTokenExpires: Date.now() + refreshedToken.expires_in * 1000,
            refreshToken: refreshedToken.refresh_token ?? token.refreshToken,
        };
    } catch (error) {
        console.error("Error refreshing access token:", error);
        return {
            ...token,
            error: "RefreshAccessTokenError",
        };
    }
}

export const authOptions = {
    providers: [
        SpotifyProvider({
            clientId: process.env.SPOTIFY_CLIENT_ID,
            clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
            authorization: {
                url: "https://accounts.spotify.com/authorize",
                params: {
                    // scope: [
                    //     "user-read-private",
                    //     "user-read-email",
                    //     "playlist-read-private",
                    //     "playlist-read-collaborative",
                    //     "user-read-currently-playing",
                    //     "user-modify-playback-state",
                    //     "playlist-read-public",
                    //     "user-top-read"
                    // ].join(" "),
                    scope: [
  "user-read-private",
  "user-read-email"
].join(" ")

                },
            },
        }),
    ],
    secret: process.env.JWT_SECRET,
    pages: {
        signIn: "/login",
    },

 callbacks: {
  async jwt({ token, account, user }) {
    if (account && user) {
      return {
        ...token,
        accessToken: account.access_token,
        refreshToken: account.refresh_token,
        accessTokenExpires: account.expires_at * 1000,
        username: user.name || user.email,
      };
    }

    // Return previous token if access token has not expired yet
    if (Date.now() < token.accessTokenExpires) {
      return token;
    }

    // Access token expired, refresh it
    return await refreshAccessToken(token);
  },

  async session({ session, token }) {
    session.user.accessToken = token.accessToken;
    session.user.refreshToken = token.refreshToken;
    session.user.username = token.username;

    return session;
  }
}


};

export default NextAuth(authOptions);
