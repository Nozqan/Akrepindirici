// WebDev Auth TypeScript types
// Auto-generated from protobuf definitions
// Generated on: 2025-09-24T05:57:57.338Z

  redirectUri: string;
  projectId: string;
  state: string;
  responseType: string;
  scope: string;
}

  redirectUrl: string;
}

  grantType: string;
  code: string;
  refreshToken?: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  idToken: string;
}

  accessToken: string;
}

  openId: string;
  projectId: string;
  name: string;
  email?: string | null;
  platform?: string | null;
  loginMethod?: string | null;
}

  openId: string;
  projectId: string;
}

  canAccess: boolean;
}

  jwtToken: string;
  projectId: string;
}

  openId: string;
  projectId: string;
  name: string;
  email?: string | null;
  platform?: string | null;
  loginMethod?: string | null;
  /** Cron-only; references `schedule_task.uid`. */
  taskUid?: string | null;
}
