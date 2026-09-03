const configuredBasePath = import.meta.env.BASE_URL || '/'

/** The app's mount point is derived from Vite so all internal links stay in /cardly. */
export const appBasePath = configuredBasePath === './' ? '' : configuredBasePath.replace(/\/$/, '')

export const appPath = (path: string) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${appBasePath}${normalizedPath}` || '/'
}

export const pathInsideApp = (pathname: string) => {
  if (!appBasePath) return pathname
  if (pathname === appBasePath) return '/'
  if (pathname.startsWith(`${appBasePath}/`)) return pathname.slice(appBasePath.length) || '/'
  return pathname
}
