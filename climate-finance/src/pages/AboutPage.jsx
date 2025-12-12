import React from 'react';
import PageLayout from '../components/layouts/PageLayout';
import PageHeader from '../components/layouts/PageHeader';
import Card from '../components/ui/Card';
import { Info, BarChart2, Users, Target } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AboutPage = () => {
  const { language } = useLanguage();
  
  return (
    <PageLayout>
      <PageHeader
        title={
          language === 'bn' ? (
            <span className="notranslate">সম্পর্কে</span>
          ) : (
            <span className="notranslate">About</span>
          )
        }
        description={
          language === 'bn' ? (
            <span className="notranslate">বাংলাদেশে জলবায়ু অর্থায়নের প্রবাহ সম্পর্কে জানুন।</span>
          ) : (
            <span className="notranslate">Learn about climate finance flows in Bangladesh.</span>
          )
        }
        icon={<Info size={28} />}
      />

      <div className="space-y-8">
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Target size={24} className="mr-3 text-purple-600" />
              {language === 'bn' ? (
                <span className="notranslate">আমাদের লক্ষ্য</span>
              ) : (
                <span className="notranslate">Our Mission</span>
              )}
            </h2>
            {language === 'bn' ? (
              <div className="notranslate">
                <p className="text-gray-600 leading-relaxed break-words">
                  গ্রীন একাইউন্টেবিলিটি মনিটর একটি উন্মুক্ত প্ল্যাটফর্ম, যা জলবায়ু অর্থায়ন সংক্রান্ত তথ্যকে স্বচ্ছ ও সবার জন্য সহজলভ্য করে তুলতে তৈরি করা হয়েছে। আমাদের লক্ষ্য হলো নীতিনির্ধারক, গবেষক, সাংবাদিক এবং সাধারণ জনগণকে বাংলাদেশজুড়ে জলবায়ু সংশ্লিষ্ট প্রকল্প ও অর্থায়নের উৎস সম্পর্কে বিস্তারিত ও হালনাগাদ তথ্যের মাধ্যমে সক্ষম করে তোলা।
                </p>
                <p className="text-gray-600 leading-relaxed mt-4 break-words whitespace-pre-line notranslate">
                  আর্থিক প্রবাহ, প্রকল্পের অগ্রগতি এবং খাতভিত্তিক বরাদ্দের বিস্তারিত বিশ্লেষণ প্রদান করে আমরা কার্যকর সিদ্ধান্ত গ্রহণে সহায়তা, জবাবদিহিতা বৃদ্ধি এবং জলবায়ু পরিবর্তনের জাতীয় প্রতিক্রিয়া সম্পর্কে ভালোভাবে বোঝার সুযোগ তৈরি করতে কাজ করছি।
                </p>
              </div>
            ) : (
              <div className="notranslate">
                <p className="text-gray-600 leading-relaxed break-words">
                  Green Accountability Monitor  is a public platform designed to bring transparency and accessibility to climate finance data. Our mission is to empower policymakers, researchers, journalists, and the public with comprehensive, up-to-date information on climate-related projects and funding sources across Bangladesh.
                </p>
                <p className="text-gray-600 leading-relaxed mt-4 break-words whitespace-pre-line notranslate">
                  By providing detailed insights into financial flows, project statuses, and sectoral allocations, we aim to support effective decision-making, enhance accountability, and foster a greater understanding of the national response to climate change.
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <BarChart2 size={24} className="mr-3 text-purple-600" />
              {language === 'bn' ? (
                <span className="notranslate">আমরা যা ট্র্যাক করি</span>
              ) : (
                <span className="notranslate">What We Track</span>
              )}
            </h2>
            {language === 'bn' ? (
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li className="break-words notranslate"><b>প্রকল্পসমূহ:</b> জলবায়ু অভিযোজন ও প্রশমন প্রকল্পের বিস্তারিত তথ্য, যেমন অবস্থা, খাত, অবস্থান ও লক্ষ্য।</li>
                <li className="break-words notranslate"><b>অর্থায়নের উৎস:</b> বিভিন্ন উন্নয়ন সহযোগী ও জাতীয় উৎস থেকে প্রতিশ্রুতি ও বিতরণের ট্র্যাকিং।</li>
                <li className="break-words notranslate"><b>আর্থিক তথ্য:</b> বিভিন্ন খাত ও অঞ্চলে মোট বিনিয়োগ, অনুদান, ঋণ ও সহ-অর্থায়নের বিশ্লেষণ।</li>
                <li className="break-words notranslate"><b>প্রভাব সূচক:</b> উপকারভোগী ও মূল কর্মক্ষমতা সূচক সংক্রান্ত তথ্য (যদি পাওয়া যায়)।</li>
              </ul>
            ) : (
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li className="break-words notranslate"><b>Projects:</b> Detailed information on climate adaptation and mitigation projects, including status, sector, location, and objectives.</li>
                <li className="break-words notranslate"><b>Funding Sources:</b> Tracking commitments and disbursements from various development partners and national sources.</li>
                <li className="break-words notranslate"><b>Financial Data:</b> Analysis of total investments, grants, loans, and co-financing across different sectors and regions.</li>
                <li className="break-words notranslate"><b>Impact Metrics:</b> Data on beneficiaries and key performance indicators where available.</li>
              </ul>
            )}
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Users size={24} className="mr-3 text-purple-600" />
              {language === 'bn' ? (
                <span className="notranslate">আমাদের তথ্য</span>
              ) : (
                <span className="notranslate">Our Data</span>
              )}
            </h2>
            {language === 'bn' ? (
              <div className="notranslate">
                <p className="text-gray-600 leading-relaxed break-words">
                  এই প্ল্যাটফর্মে উপস্থাপিত তথ্য সরকারী সংস্থা, উন্নয়ন সহযোগী এবং আন্তর্জাতিক জলবায়ু তহবিলের প্রকাশিত উৎস থেকে সংগ্রহ করা হয়েছে। আমরা আমাদের তথ্যের যথার্থতা ও সময়োপযোগিতা নিশ্চিত করার চেষ্টা করি, তবে ব্যবহারকারীদের অফিসিয়াল রেকর্ডের জন্য মূল উৎস পরামর্শ করার পরামর্শ দিই।
                </p>
              </div>
            ) : (
              <div className="notranslate">
                <p className="text-gray-600 leading-relaxed break-words">
                  The data presented on this platform is aggregated from publicly available sources, including reports from government agencies, development partners, and international climate funds. We strive to ensure the accuracy and timeliness of our data, but we encourage users to consult the original sources for official records.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

export default AboutPage; 