// preview page for newly created UI components
import Skeleton from "@/components/Skeleton"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-body mb-4">Avatar</h3>
        <div className="flex items-center gap-4">
          <Avatar name="alice" />
          <Avatar name="Alice" />
          <Avatar name="PocketHeist" />
          <Avatar name="MarioKart" />
        </div>
      </section>

      <section className="mt-8">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-body mb-4">Skeleton</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      </section>
    </div>
  )
}
