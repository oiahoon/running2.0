'use client'

import { useState, useEffect } from 'react'
import { 
  Button,
  Badge,
  Input,
  Textarea,
  Switch,
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
  Alert,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Field,
  Label,
  Fieldset
} from '@/components/catalyst'

// Simple SVG Icons
const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
)

const RefreshIcon = ({ spinning = false }: { spinning?: boolean }) => (
  <svg className={`w-4 h-4 ${spinning ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
)

const SettingsIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

interface DataSourceType {
  id: string
  name: string
  type: string
  description: string
  authMethods: string[]
  supportedActivities: string[]
  setupInstructions: string[]
  configured: boolean
}

interface ConfiguredSource {
  id: string
  name: string
  type: string
  enabled: boolean
  status: 'active' | 'inactive' | 'error'
  lastSync?: string
  errorMessage?: string
  supportedActivities: string[]
}

export default function DataSourcesPage() {
  const [availableTypes, setAvailableTypes] = useState<DataSourceType[]>([])
  const [configuredSources, setConfiguredSources] = useState<ConfiguredSource[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  useEffect(() => {
    fetchDataSources()
  }, [])

  const fetchDataSources = async () => {
    try {
      const response = await fetch('/api/data-sources')
      const data = await response.json()
      setAvailableTypes(data.availableTypes || [])
      setConfiguredSources(data.configuredSources || [])
    } catch (error) {
      console.error('Failed to fetch data sources:', error)
      // Set mock data for development
      setAvailableTypes([
        {
          id: 'nike',
          name: 'Nike Run Club',
          type: 'api',
          description: 'Sync activities from Nike Run Club',
          authMethods: ['access_token'],
          supportedActivities: ['Run', 'Walk'],
          setupInstructions: [
            'Sign in to Nike.com',
            'Open browser developer tools (F12)',
            'Go to Application > Local Storage > https://www.nike.com',
            'Copy the "access_token" value'
          ],
          configured: false
        },
        {
          id: 'strava',
          name: 'Strava',
          type: 'api',
          description: 'Sync activities from Strava (already configured)',
          authMethods: ['oauth2'],
          supportedActivities: ['Run', 'Walk', 'Ride', 'Swim'],
          setupInstructions: ['Already configured'],
          configured: true
        }
      ])
      setConfiguredSources([])
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      // Mock sync for now
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Data Sources
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your activity data integrations
            </p>
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleSync}
              disabled={syncing}
              outline
            >
              <RefreshIcon spinning={syncing} />
              <span className="ml-2">Sync All</span>
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <PlusIcon />
              <span className="ml-2">Add Data Source</span>
            </Button>
          </div>
        </div>

        <TabGroup>
          <TabList>
            <Tab>Configured Sources ({configuredSources.length})</Tab>
            <Tab>Available Sources ({availableTypes.length})</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="mt-6">
                {configuredSources.length === 0 ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-12 text-center border border-gray-200 dark:border-gray-700">
                    <div className="text-gray-400 mb-4">
                      <SettingsIcon />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No data sources configured
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Add your first data source to start syncing activities
                    </p>
                    <Button onClick={() => setShowAddDialog(true)}>
                      <PlusIcon />
                      <span className="ml-2">Add Data Source</span>
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {configuredSources.map(source => (
                      <ConfiguredSourceCard
                        key={source.id}
                        source={source}
                        syncing={syncing}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabPanel>
            
            <TabPanel>
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {availableTypes.map(type => (
                  <AvailableSourceCard
                    key={type.id}
                    type={type}
                    onAdd={() => setShowAddDialog(true)}
                  />
                ))}
              </div>
            </TabPanel>
          </TabPanels>
        </TabGroup>

        <Dialog open={showAddDialog} onClose={setShowAddDialog}>
          <DialogTitle>Add Data Source</DialogTitle>
          <DialogDescription>
            Choose a data source to integrate with your running page
          </DialogDescription>
          <DialogBody>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <InfoIcon />
                  <div>
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Coming Soon!
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      Multiple data source integration is currently in development. 
                      For now, you can use Strava integration which is already configured.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogActions>
            <Button onClick={() => setShowAddDialog(false)}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  )
}

function ConfiguredSourceCard({ 
  source, 
  syncing 
}: { 
  source: ConfiguredSource
  syncing: boolean
}) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'green'
      case 'inactive': return 'gray'
      case 'error': return 'red'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckIcon />
      case 'inactive': return <ClockIcon />
      case 'error': return <XIcon />
      default: return <ClockIcon />
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{source.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{source.type}</p>
        </div>
        <Badge color={getStatusColor(source.status)}>
          <div className="flex items-center gap-1">
            {getStatusIcon(source.status)}
            {source.status}
          </div>
        </Badge>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">Enabled</span>
          <Switch checked={source.enabled} />
        </div>
        
        {source.lastSync && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Last Sync</span>
            <span className="text-sm font-medium">
              {new Date(source.lastSync).toLocaleDateString()}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {source.supportedActivities.map(activity => (
            <Badge key={activity} color="zinc">
              {activity}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            disabled={syncing || !source.enabled}
            className="flex-1"
          >
            <RefreshIcon spinning={syncing} />
            <span className="ml-2">Sync</span>
          </Button>
          <Button outline>
            <SettingsIcon />
          </Button>
        </div>
      </div>
    </div>
  )
}

function AvailableSourceCard({ 
  type, 
  onAdd 
}: { 
  type: DataSourceType
  onAdd: () => void
}) {
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 ${type.configured ? 'opacity-60' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{type.name}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{type.type}</p>
        </div>
        {type.configured && (
          <Badge color="zinc">Configured</Badge>
        )}
      </div>

      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {type.description}
        </p>

        <div className="flex flex-wrap gap-1">
          {type.supportedActivities.map(activity => (
            <Badge key={activity} color="zinc">
              {activity}
            </Badge>
          ))}
        </div>

        <Button
          onClick={onAdd}
          disabled={type.configured}
          className="w-full"
          color={type.configured ? "zinc" : "blue"}
        >
          {type.configured ? 'Already Added' : 'Add Source'}
        </Button>
      </div>
    </div>
  )
}
