import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface UsePaginationProps {
  defaultPageSize?: number
  searchFields?: string[]
  statusField?: string
  dateField?: string
}

export function usePagination({
  defaultPageSize = 10,
  searchFields,
  statusField,
  dateField,
}: UsePaginationProps = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1)
  const [pageSize, setPageSize] = useState(Number(searchParams.get('limit')) || defaultPageSize)
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [startDate, setStartDate] = useState<Date | undefined>(
    searchParams.get('startDate') ? new Date(searchParams.get('startDate')!) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    searchParams.get('endDate') ? new Date(searchParams.get('endDate')!) : undefined
  )

  const updateQueryParams = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (page > 1) params.set('page', page.toString())
    else params.delete('page')
    
    if (pageSize !== defaultPageSize) params.set('limit', pageSize.toString())
    else params.delete('limit')
    
    if (search) params.set('search', search)
    else params.delete('search')
    
    if (status) params.set('status', status)
    else params.delete('status')
    
    if (startDate) params.set('startDate', startDate.toISOString())
    else params.delete('startDate')
    
    if (endDate) params.set('endDate', endDate.toISOString())
    else params.delete('endDate')

    router.push(`?${params.toString()}`)
  }, [page, pageSize, search, status, startDate, endDate, router, searchParams, defaultPageSize])

  useEffect(() => {
    updateQueryParams()
  }, [updateQueryParams])

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage)
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value)
    setPage(1) // Reset to first page when searching
  }, [])

  const handleStatusChange = useCallback((value: string) => {
    setStatus(value)
    setPage(1) // Reset to first page when changing status
  }, [])

  const handleStartDateChange = useCallback((date: Date | undefined) => {
    setStartDate(date)
    setPage(1) // Reset to first page when changing date range
  }, [])

  const handleEndDateChange = useCallback((date: Date | undefined) => {
    setEndDate(date)
    setPage(1) // Reset to first page when changing date range
  }, [])

  return {
    page,
    pageSize,
    search,
    status,
    startDate,
    endDate,
    handlePageChange,
    handlePageSizeChange,
    handleSearchChange,
    handleStatusChange,
    handleStartDateChange,
    handleEndDateChange,
  }
} 