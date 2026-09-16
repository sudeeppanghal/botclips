import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity
} from 'react-native';
import { Search, Zap, ShieldCheck, ChevronRight } from 'lucide-react-native';
import { AppHeader } from '../components/AppHeader';
import { GlassCard } from '../components/GlassCard';
import { BotClipsApi } from '../services/api';
import { ServiceItem, PlatformType } from '../types';
import { COLORS } from '../constants/theme';

interface ServicesScreenProps {
  onSelectService: (service: ServiceItem) => void;
}

export const ServicesScreen: React.FC<ServicesScreenProps> = ({ onSelectService }) => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [search, setSearch] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('ALL');

  useEffect(() => {
    BotClipsApi.getServices().then(setServices);
  }, []);

  const filtered = services.filter((s) => {
    const matchPlatform =
      filterPlatform === 'ALL' || s.platform.toUpperCase() === filterPlatform.toUpperCase();
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  return (
    <View style={styles.container}>
      <AppHeader subtitle="LIVE SERVICE CATALOG" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchWrapper}>
          <Search size={18} color={COLORS.cyan} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search organic services (e.g. TikTok, Reels)..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Platform Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {['ALL', 'INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TELEGRAM'].map((plat) => (
            <TouchableOpacity
              key={plat}
              style={[styles.filterPill, filterPlatform === plat && styles.filterPillActive]}
              onPress={() => setFilterPlatform(plat)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filterPlatform === plat && styles.filterPillTextActive
                ]}
              >
                {plat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services List */}
        <Text style={styles.sectionHeading}>AVAILABLE AUTOMATION SERVICES ({filtered.length})</Text>
        {filtered.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.serviceCard}
            onPress={() => onSelectService(service)}
            activeOpacity={0.8}
          >
            <View style={styles.serviceHeader}>
              <View style={styles.serviceTitleCol}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceDesc}>{service.description}</Text>
              </View>
              <View style={styles.rateBadge}>
                <Text style={styles.rateText}>₹{service.rate.toFixed(2)}/1K</Text>
              </View>
            </View>

            <View style={styles.serviceFooter}>
              <View style={styles.limitTags}>
                <Text style={styles.limitTag}>Min: {service.min.toLocaleString()}</Text>
                <Text style={styles.limitTag}>Max: {service.max.toLocaleString()}</Text>
              </View>
              <View style={styles.orderActionRow}>
                <Text style={styles.orderActionText}>Order Now</Text>
                <ChevronRight size={14} color={COLORS.cyan} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    marginVertical: 10
  },
  searchIcon: {
    marginRight: 10
  },
  searchInput: {
    flex: 1,
    height: 46,
    color: '#FFFFFF',
    fontSize: 13
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 14
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8
  },
  filterPillActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderColor: COLORS.cyan
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary
  },
  filterPillTextActive: {
    color: COLORS.cyan
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10
  },
  serviceCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  serviceTitleCol: {
    flex: 1,
    marginRight: 10
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF'
  },
  serviceDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: 16
  },
  rateBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  rateText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.cyan
  },
  serviceFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(56, 189, 248, 0.1)',
    paddingTop: 10,
    marginTop: 10
  },
  limitTags: {
    flexDirection: 'row',
    gap: 8
  },
  limitTag: {
    fontSize: 10,
    color: COLORS.textMuted,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  orderActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  orderActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.cyan
  }
});
