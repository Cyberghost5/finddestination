class RoomTypeModel {
  final int id;
  final String name;
  final int priceKobo;
  final String priceFormatted;
  final int maxOccupancy;
  final String bedType;
  final int totalUnits;

  RoomTypeModel({
    required this.id,
    required this.name,
    required this.priceKobo,
    required this.priceFormatted,
    this.maxOccupancy = 2,
    this.bedType = 'Standard Double',
    this.totalUnits = 1,
  });

  factory RoomTypeModel.fromJson(Map<String, dynamic> json) {
    final rawKobo = json['price_kobo'] ?? json['base_price_kobo'] ?? 3500000;
    final kobo = rawKobo is int ? rawKobo : int.tryParse(rawKobo.toString()) ?? 3500000;

    return RoomTypeModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id'].toString()) ?? 0,
      name: json['name'] ?? 'Standard Room',
      priceKobo: kobo,
      priceFormatted: json['price_formatted'] ?? '₦${(kobo / 100).round()}',
      maxOccupancy: json['max_occupancy'] is int
          ? json['max_occupancy']
          : int.tryParse(json['max_occupancy'].toString()) ?? 2,
      bedType: json['bed_type'] ?? 'Double Bed',
      totalUnits: json['total_units'] is int
          ? json['total_units']
          : int.tryParse(json['total_units'].toString()) ?? 1,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price_kobo': priceKobo,
      'price_formatted': priceFormatted,
      'max_occupancy': maxOccupancy,
      'bed_type': bedType,
      'total_units': totalUnits,
    };
  }
}
