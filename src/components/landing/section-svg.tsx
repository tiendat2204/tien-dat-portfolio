import { Plus } from 'lucide-react'

const SectionSvg = ({ crossesOffset }: { crossesOffset: string }) => {
  return (
    <>
      <Plus
        className={`hidden absolute -top-1.25 h-6 w-6 ${crossesOffset} pointer-events-none lg:block lg:left-[3.275rem] text-neutral-500 dark:text-neutral-300 translate-y-[.5px]`}
      />

      <Plus
        className={`hidden absolute -top-1.25 h-6 w-6 right-[1.4625rem] ${crossesOffset} pointer-events-none lg:block lg:right-[2.7750rem] text-neutral-500 dark:text-neutral-300 translate-y-[.5px]`}
      />
    </>
  )
}

export default SectionSvg
