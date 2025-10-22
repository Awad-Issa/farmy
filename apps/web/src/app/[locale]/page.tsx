/**
 * Root page - redirects to dashboard
 */

import { redirect } from 'next/navigation';

export default function HomePage({ params }: { params: { locale: string } }) {
  redirect(`/${params.locale}/dashboard`);
}
