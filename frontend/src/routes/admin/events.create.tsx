import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { Layout } from '@/components/Layout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useState } from 'react'

export const Route = createFileRoute('/admin/events/create')({
  component: CreateEventPage,
})

function CreateEventPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_date: '',
    registration_deadline: '',
    is_paid: false,
    price: '0',
    max_participants: '',
    status: 'draft',
  })
  const [formSchema, setFormSchema] = useState<Record<string, any>>({})
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/admin/events', data)
      return response.data
    },
    onSuccess: () => {
      navigate({ to: '/admin/dashboard' })
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Failed to create event')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      ...formData,
      price: parseFloat(formData.price),
      max_participants: formData.max_participants ? parseInt(formData.max_participants) : null,
      form_schema: Object.keys(formSchema).length > 0 ? formSchema : null,
    })
  }

  const addFormField = () => {
    const key = `field_${Date.now()}`
    setFormSchema({
      ...formSchema,
      [key]: { label: '', type: 'text', required: false },
    })
  }

  const updateFormField = (key: string, field: any) => {
    setFormSchema({ ...formSchema, [key]: field })
  }

  const removeFormField = (key: string) => {
    const newSchema = { ...formSchema }
    delete newSchema[key]
    setFormSchema(newSchema)
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <Layout>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Create Event</h1>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event Date *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Registration Deadline *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.registration_deadline}
                    onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_paid}
                    onChange={(e) => setFormData({ ...formData, is_paid: e.target.checked })}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Paid Event</span>
                </label>
                {formData.is_paid && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants (leave empty for unlimited)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Registration Form Fields</label>
                  <button
                    type="button"
                    onClick={addFormField}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                  >
                    Add Field
                  </button>
                </div>
                <div className="space-y-4 border border-gray-200 rounded-md p-4">
                  {Object.entries(formSchema).map(([key, field]) => (
                    <div key={key} className="flex gap-4 items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Field Label</label>
                        <input
                          type="text"
                          value={field.label || ''}
                          onChange={(e) => updateFormField(key, { ...field, label: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          placeholder="Field label"
                        />
                      </div>
                      <div className="w-32">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                          value={field.type || 'text'}
                          onChange={(e) => updateFormField(key, { ...field, type: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="number">Number</option>
                          <option value="textarea">Textarea</option>
                        </select>
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.required || false}
                            onChange={(e) => updateFormField(key, { ...field, required: e.target.checked })}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">Required</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFormField(key)}
                        className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {Object.keys(formSchema).length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                      No form fields. Click "Add Field" to create a registration form.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate({ to: '/admin/dashboard' })}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </Layout>
    </ProtectedRoute>
  )
}
