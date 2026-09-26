/* THIS FILE IS GENERATED FROM THE PAYLOAD TEMPLATE — safe to regenerate */
import { RootPage } from '@payloadcms/next/views'
import config from '@payload-config'

import { importMap } from '../importMap'

const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string | string[]>>
}) => {
  return RootPage({
    config,
    importMap,
    params,
    searchParams,
  })
}

export default Page
