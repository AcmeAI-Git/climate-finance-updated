import React, { useState, useEffect, useMemo } from 'react';
import { Building, Globe, ExternalLink, DollarSign, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/layouts/PageLayout';
import PageHeader from '../components/layouts/PageHeader';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import PieChartComponent from '../components/charts/PieChartComponent';
import LineChartComponent from '../components/charts/LineChartComponent';
import BarChartComponent from '../components/charts/BarChartComponent';
import Button from '../components/ui/Button';
import Loading from '../components/ui/Loading';
import SearchFilter from '../components/ui/SearchFilter';
import ExportButton from '../components/ui/ExportButton';
import { formatCurrency } from '../utils/formatters';
import { CHART_COLORS } from '../utils/constants';
import { generateOrganizationLogo } from '../utils/svgPlaceholder';
import { fundingSourceApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { translateChartData, getChartTitle } from '../utils/chartTranslations';



const FundingSources = () => {
  // State management
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    type: 'All',
    region: 'All',
    status: 'All'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // API data states
  const [fundingSourcesList, setFundingSourcesList] = useState([]);
  const [overviewStats, setOverviewStats] = useState([]);
  const [fundingByType, setFundingByType] = useState([]);
  const [fundingTrend, setFundingTrend] = useState([]);

  // Language context
  const { language } = useLanguage();

  // Fetch all funding source data
  useEffect(() => {
    fetchAllFundingData();
  }, []);

  const fetchAllFundingData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Simplified fetch - only get funding sources
      const fundingSourceResponse = await fundingSourceApi.getAll();
      const sources = fundingSourceResponse?.data || [];
      
      setFundingSourcesList(sources);

      // Calculate overview stats from sources
      const overviewData = {
        total_climate_finance: sources.reduce((sum, fs) => 
          sum + (fs.grant_amount || 0) + (fs.loan_amount || 0), 0),
        active_funding_source: sources.length,
        committed_funds: sources.reduce((sum, fs) => sum + (fs.grant_amount || 0), 0),
        disbursed_funds: sources.reduce((sum, fs) => sum + (fs.disbursement || 0), 0)
      };

      setOverviewStats([
        {
          title: "Total Climate Finance",
          value: formatCurrency(overviewData.total_climate_finance),
          change: "All-time total"
        },
        {
          title: "Active Funding Sources",
          value: overviewData.active_funding_source,
          change: `${new Set(sources.map(s => s.type).filter(Boolean)).size} categories`
        },
        {
          title: "Committed Funds",
          value: formatCurrency(overviewData.committed_funds),
          change: `${sources.length} funding sources`
        }
      ]);

      // Calculate funding by type
      const typeData = sources.reduce((acc, fs) => {
        const type = fs.type || (fs.grant_amount > 0 ? 'Grant' : 'Loan');
        if (!acc[type]) acc[type] = { count: 0, totalAmount: 0 };
        acc[type].count++;
        acc[type].totalAmount += (fs.grant_amount || 0) + (fs.loan_amount || 0);
        return acc;
      }, {});

      const fundingByType = Object.entries(typeData).map(([name, data]) => ({
        name,
        value: data.totalAmount,
        count: data.count
      }));
      setFundingByType(fundingByType);


      // Remove trend chart - set to empty
      setFundingTrend([]);

      setRetryCount(0);
    } catch (error) {
      console.error('Error fetching funding source data:', error);
      setError(error.message || 'Failed to load funding source data. Please try again.');
      
      // Clear all data on error
      setFundingSourcesList([]);
      setOverviewStats([]);
      setFundingByType([]);
      setFundingTrend([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchAllFundingData();
  };

  // Better filtering with null checks
  const filteredSources = useMemo(() => {
    if (!Array.isArray(fundingSourcesList)) return [];
    
    return fundingSourcesList.filter(source => {
      const matchesSearch = (source.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (source.dev_partner?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                           (source.funding_source_id?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesType = activeFilters.type === 'All' || source.type === activeFilters.type;
      const matchesRegion = activeFilters.region === 'All' || source.region === activeFilters.region;
      const matchesStatus = activeFilters.status === 'All' || source.status === activeFilters.status;
      
      return matchesSearch && matchesType && matchesRegion && matchesStatus;
    });
  }, [fundingSourcesList, searchTerm, activeFilters]);

  const translatedFundingByType = translateChartData(fundingByType, language, 'fundingSourceType');

  if (isLoading) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <div className="flex flex-col justify-center items-center min-h-64">
          <Loading size="lg" />
          <p className="mt-4 text-gray-600">Loading funding sources...</p>
          {retryCount > 0 && (
            <p className="mt-2 text-sm text-gray-500">Retry attempt: {retryCount}</p>
          )}
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout bgColor="bg-gray-50">
        <Card padding={true}>
          <div className="text-center py-12">
            <div className="text-red-600 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Unable to Load Funding Sources</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button 
                onClick={handleRetry}
                leftIcon={<RefreshCw size={16} />}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Retry
              </Button>
              <Button 
                onClick={() => navigate('/admin')}
                variant="outline"
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Go to Dashboard
              </Button>
            </div>
            {retryCount > 2 && (
              <p className="mt-4 text-sm text-gray-500">
                If the problem persists, please contact the system administrator.
              </p>
            )}
          </div>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout bgColor="bg-gray-50">
      <PageHeader
        title="Funding Sources"
        subtitle="Learn climate finance funding sources and their significance"
        actions={
          <ExportButton
            data={{
              fundingSources: filteredSources,
              overview: overviewStats,
              chartData: {
                fundingByType,
                fundingTrend
              }
            }}
            filename="funding_sources"
            title="Climate Finance Funding Sources"
            subtitle="Comprehensive data on funding sources and contributions"
            variant="export"
            exportFormats={['pdf', 'json', 'csv']}
            className="w-full sm:w-auto"
          />
        }
      />

      {/* Overview Stats */}
      {overviewStats.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {overviewStats.map((stat, index) => {
            const icons = [<DollarSign size={20} />, <Building size={20} />, <TrendingUp size={20} />];
            return (
              <div 
                key={index}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StatCard 
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  color={index % 2 === 0 ? 'primary' : 'success'}
                  icon={icons[index]}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mb-8">
          <Card padding={true}>
            <div className="text-center py-6">
              <AlertCircle size={24} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Statistics unavailable</p>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Row */}
      <div className="mb-6">
        {/* Funding by Type - Full Width */}
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Card hover padding={true}>
            {fundingByType.length > 0 ? (
              <PieChartComponent
                title={getChartTitle(language, 'fundingByType')}
                data={translatedFundingByType}
                valueKey="value"
                nameKey="name"
              />
            ) : (
              <div className="h-[300px] flex items-center justify-center">
                <div className="text-center">
                  <AlertCircle size={24} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600">No funding type data available</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>


      {/* Funding Sources List */}
      <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
        <Card hover className="mb-6" padding={true}>
          <div className="border-b border-gray-100 pb-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Climate Finance Sources</h3>
            
            <SearchFilter
              data={fundingSourcesList}
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              searchPlaceholder="Search funding sources by name, partner, ID..."
              entityType="fundingSources"
              activeFilters={activeFilters}
              onFiltersChange={setActiveFilters}
              showAdvancedSearch={true}
              onClearAll={() => {
                setSearchTerm('');
                setActiveFilters({
                  type: 'All',
                  region: 'All',
                  status: 'All'
                });
              }}
            />
          </div>

          {/* Sources Grid */}
          {fundingSourcesList.length === 0 ? (
            <div className="text-center py-12">
              <Building size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No funding sources available</h3>
              <p className="text-gray-500 mb-4">
                There are currently no funding sources in the system.
              </p>
              <Button
                onClick={handleRetry}
                leftIcon={<RefreshCw size={16} />}
                variant="outline"
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredSources.map((source, index) => (
                <div 
                  key={source.funding_source_id || source.id || index}
                  className="flex flex-col lg:flex-row lg:items-center p-6 border border-gray-200 rounded-xl hover:border-purple-300 hover:shadow-md transition-all duration-200 group"
                >
                  {/* Logo and Basic Info */}
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="flex-shrink-0">
                      <img 
                        src={generateOrganizationLogo(source.name || 'Unknown', source.type || 'Unknown', 64)} 
                        alt={source.name || 'Unknown Source'} 
                        className="w-16 h-16 rounded-xl border border-gray-100 shadow-sm flex-shrink-0 group-hover:border-purple-200 transition-colors" 
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2 sm:mb-0">
                          {source.name || 'Unknown Source'}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {source.type && (
                            <span className="inline-flex px-2.5 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                              {source.type}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {source.dev_partner && (
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <Globe size={14} className="mr-2 flex-shrink-0" />
                          <span>Development Partner: {source.dev_partner}</span>
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-500">
                        {source.description || `${source.type || 'Funding'} organization supporting climate finance initiatives`}
                      </div>
                    </div>
                  </div>

                  {/* Financial Info and Actions */}
                  <div className="mt-6 lg:mt-0 lg:ml-6 flex-shrink-0">
                    <div className="flex items-end gap-4 lg:gap-6">
                      {/* Grant Amount */}
                      {(source.grant_amount || source.total_committed) && (
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">
                            {source.grant_amount ? 'Grant Amount' : 'Total Committed'}
                          </div>
                          <div className="text-lg font-semibold text-gray-900">
                            {formatCurrency(source.grant_amount || source.total_committed)}
                          </div>
                        </div>
                      )}
                      
                      {/* Disbursed */}
                      {(source.disbursement || source.total_disbursed) && (
                        <div className="text-center">
                          <div className="text-sm text-gray-500 mb-1">Disbursed</div>
                          <div className="text-lg font-semibold text-green-600">
                            {formatCurrency(source.disbursement || source.total_disbursed)}
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex-shrink-0">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            const id = source.funding_source_id || source.id;
                            if (id) {
                              navigate(`/funding-sources/${id}`);
                            } else {
                              console.error('No valid ID found for funding source:', source);
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 text-purple-600 border-purple-600 hover:bg-purple-50"
                        >
                          <ExternalLink size={14} />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredSources.length === 0 && fundingSourcesList.length > 0 && (
            <div className="text-center py-12">
              <Building size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No funding sources found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
              <Button
                onClick={() => {
                  setSearchTerm('');
                  setActiveFilters({
                    type: 'All',
                    region: 'All',
                    status: 'All'
                  });
                }}
                variant="outline"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </Card>
      </div>
    </PageLayout>
  );
};

export default FundingSources;
