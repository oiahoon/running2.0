'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { useActivities } from '@/lib/hooks/useActivities'
import { getActivityConfig, shouldShowOnMap } from '@/lib/config/activities'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { ActivityIcon } from '@/components/icons/AtlasIcon'
import { useI18n } from '@/lib/i18n'

// Custom hook for debounced value
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface Activity {
  id: number
  name: string
  type: string
  distance: number
  start_date: string
  start_latitude?: number
  start_longitude?: number
}

interface ActivitySelectorProps {
  selectedActivity: Activity | null
  onActivitySelect: (activity: Activity | null) => void
  className?: string
}

export default function ActivitySelector({ 
  selectedActivity, 
  onActivitySelect, 
  className = '' 
}: ActivitySelectorProps) {
  const { t, dateLocale } = useI18n()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const listboxId = useId()
  const triggerButtonRef = useRef<HTMLButtonElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const pageSize = 50 // Increase page size for better UX

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    if (!isOpen) return
    const focusFrame = window.requestAnimationFrame(() => searchInputRef.current?.focus())
    return () => window.cancelAnimationFrame(focusFrame)
  }, [isOpen])

  // Fetch activities with GPS data only
  const { data, isLoading, error } = useActivities({
    search: debouncedSearchTerm || undefined
  }, 1, pageSize)

  // Filter activities that should show on map
  const activities = (data?.activities || []).filter((activity: Activity) => 
    shouldShowOnMap(activity.type) && activity.start_latitude && activity.start_longitude
  )

  const totalCount = data?.pagination?.total || data?.summary?.totalActivities || activities.length

  const closeSelector = (restoreTriggerFocus = false) => {
    setIsOpen(false)
    if (restoreTriggerFocus) {
      window.requestAnimationFrame(() => triggerButtonRef.current?.focus())
    }
  }

  const handleSelect = (activity: Activity) => {
    onActivitySelect(activity)
    closeSelector(true)
  }

  const handleClear = () => {
    onActivitySelect(null)
    closeSelector(true)
  }

  if (error) {
    console.error('ActivitySelector error:', error)
  }

  return (
    <div
      className={`relative ${className}`}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && isOpen) {
          event.preventDefault()
          event.stopPropagation()
          closeSelector(true)
        }
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        ref={triggerButtonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowDown') {
            event.preventDefault()
            setIsOpen(true)
          }
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className="relative min-h-11 w-full cursor-default rounded-md border border-[var(--line-strong)] bg-[var(--surface)] py-2 pl-3 pr-10 text-left text-[var(--text-strong)] outline-none transition hover:border-[var(--route-green)] focus-visible:ring-2 focus-visible:ring-[var(--route-green)] sm:text-sm"
      >
        <span className="block truncate">
          {selectedActivity ? (
            <span className="flex items-center">
              <ActivityIcon type={selectedActivity.type} className="mr-2 h-4 w-4 text-[var(--route-green)]" />
              {selectedActivity.name} ({(selectedActivity.distance / 1000).toFixed(1)}km)
            </span>
          ) : (
            t('activitySelector.select')
          )}
        </span>
        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
          {isOpen ? (
            <ChevronUpIcon className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-96 w-full overflow-hidden rounded-md border border-[var(--line)] bg-[var(--surface)] shadow-lg focus:outline-none">
          {/* Search */}
          <div className="border-b border-[var(--line)] p-2">
            <input
              type="text"
              ref={searchInputRef}
              aria-label={t('activitySelector.search')}
              placeholder={t('activitySelector.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-[var(--line-strong)] bg-[var(--surface-raised)] px-3 py-2 text-sm text-[var(--text-strong)] outline-none placeholder:text-[var(--text-muted)] focus:ring-2 focus:ring-[var(--route-green)]"
            />
          </div>

          {/* Clear Option */}
          <div className="border-b border-[var(--line)]">
            <button
              onClick={handleClear}
              className="min-h-11 w-full px-3 py-2 text-left text-sm text-[var(--text-muted)] hover:bg-[var(--surface-raised)]"
            >
              {t('activitySelector.clear')}
            </button>
          </div>

          {/* Activities List */}
          <div id={listboxId} role="listbox" aria-label={t('activitySelector.select')} className="max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {t('activities.loading')}
              </div>
            ) : activities.length > 0 ? (
              <>
                {activities.map((activity: Activity) => {
                  const config = getActivityConfig(activity.type)
                  const isSelected = selectedActivity?.id === activity.id
                  
                  return (
                    <button
                      key={activity.id}
                      onClick={() => handleSelect(activity)}
                      role="option"
                      aria-selected={isSelected}
                      className={`min-h-11 w-full px-3 py-2 text-left text-sm hover:bg-[var(--surface-raised)] ${
                        isSelected ? 'bg-[var(--route-green)]/10 text-[var(--route-green)]' : 'text-[var(--text-strong)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          <ActivityIcon type={config.type} className="h-4 w-4 text-[var(--route-green)]" />
                          <span className="truncate">{activity.name}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{(activity.distance / 1000).toFixed(1)}km</span>
                          <span>{new Date(activity.start_date).toLocaleDateString(dateLocale)}</span>
                        </div>
                      </div>
                    </button>
                  )
                })}
                
                {/* Show count info */}
                <div className="border-t border-[var(--line)] bg-[var(--surface-raised)] p-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    {t('activitySelector.showing', { shown: activities.length, total: totalCount })}
                    {debouncedSearchTerm ? t('activitySelector.matching', { term: debouncedSearchTerm }) : ''}
                  </div>
                </div>
              </>
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                {debouncedSearchTerm ? t('activitySelector.emptySearch', { term: debouncedSearchTerm }) : t('activities.empty')}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => closeSelector(true)}
        />
      )}
    </div>
  )
}
